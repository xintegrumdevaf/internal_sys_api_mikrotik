

import { Client, type ClientChannel, type ConnectConfig } from "ssh2";
import { Logger } from "../../shared/utils/logger.js";
import type { Step } from "../../domain/olt/entities/step.entity.js";

export interface SSHOptions {
    timeout?: number;
}

type Waiter = undefined | {
    regex: RegExp;
    resolve: (value: any) => void;
    reject: (err: Error) => void;
    timeout: NodeJS.Timeout;
};

export class SSHService {

    private conn: Client;
    private stream!: ClientChannel;

    private readonly config: ConnectConfig;
    private readonly timeout: number;

    private output = "";
    private buffer = "";
    private result = "";

    private liveBuffer = "";
    private commandBuffer = "";

    private waiter?: Waiter;
    private isRunning = false;

    constructor(config: ConnectConfig, options?: SSHOptions) {
        this.conn = new Client();
        this.config = config;
        this.timeout = options?.timeout ?? 30000; // 👈 importante: 30s default
    }

    // =====================================================
    // CONNECT
    // =====================================================
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {

            this.conn
                .once("ready", () => {
                    Logger.success("SSH conectado", "SSH");
                    resolve();
                })
                .once("error", reject)
                .connect(this.config);

        });
    }

    // =====================================================
    // OPEN SHELL
    // =====================================================
    public openShell(): Promise<void> {

        return new Promise((resolve, reject) => {

            this.conn.shell(
                {
                    term: "vt100", // 👈 más estable que xterm
                    cols: 120,
                    rows: 80
                },
                (err, stream) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    this.stream = stream;

                    Logger.success("Shell abierta", "SSH");

                    // 🔥 UN SOLO LISTENER PARA TODO EL CICLO DE VIDA
                    stream.on("data", (chunk: Buffer) => {

                        const txt = this.cleanAnsi(chunk.toString());

                        this.output += txt;
                        this.buffer += txt;

                        this.liveBuffer += txt;
                        this.commandBuffer += txt;

                        Logger.info(`DATA EVENT: ${JSON.stringify(txt)}`, "SSH");

                        this.checkWaiter();

                    });

                    stream.on("error", (err: any) => {
                        Logger.error(err, "SSH");
                    });

                    stream.on("close", () => {
                        Logger.warn("Shell cerrada", "SSH");
                    });

                    resolve();

                }
            );

        });

    }

    // =====================================================
    // WAIT FOR (SIN INTERVAL)
    // =====================================================
    public waitFor(regex: RegExp): Promise<void> {

        Logger.info(`WAIT FOR: ${regex}`, "SSH");

        return new Promise((resolve, reject) => {

            this.waiter = {
                regex,
                resolve: (value: any) => {
                    Logger.success(`MATCH: ${regex}`, "SSH");
                    resolve(value);
                },
                reject,
                timeout: setTimeout(() => {

                    const err = new Error(
                        `Timeout esperando ${regex}\nBUFFER:\n${this.buffer}`
                    );

                    Logger.error(err.message, "SSH");

                    this.waiter = undefined;

                    reject(err);

                }, this.timeout)
            };

            // 🔥 por si ya llegó el texto antes de esperar
            this.checkWaiter();

        });

    }

    // =====================================================
    // WAIT FOR (INTERVAL)
    // =====================================================
    public async waitForAny(regexes: RegExp[]): Promise<number> {

        return new Promise((resolve, reject) => {

            const interval = setInterval(() => {

                for (let i = 0; i < regexes.length; i++) {

                    if (regexes[i]!.test(this.buffer)) {

                        clearInterval(interval);

                        resolve(i);

                        return;

                    }

                }

            }, 20);

            setTimeout(() => {

                clearInterval(interval);

                reject(new Error("Timeout"));

            }, this.timeout);

        });

    }

    // =====================================================
    // CHECK WAITER
    // =====================================================

    private checkWaiter(): void {

        if (!this.waiter) return;

        const match = this.waiter.regex.test(this.buffer);

        Logger.debug(`CHECK WAITER -> ${match}`, "SSH");

        if (match) {

            clearTimeout(this.waiter.timeout);

            const resolve = this.waiter.resolve;

            const value = this.buffer; // 👈 COPIA REAL

            this.waiter = undefined;

            resolve(value);

            return;
        }
    }

    // =====================================================
    // SEND
    // =====================================================
    public send(command: string): Promise<void> {

        return new Promise((resolve, reject) => {

            Logger.info(`SEND: ${command}`, "SSH");

            this.stream.write(command + "\n", (err) => {

                if (err) {
                    reject(err);
                    return;
                }

                resolve();

            });

        });

    }

    // =====================================================
    // RUN STEPS (LOGIN / CONFIG FLOW)
    // =====================================================

    public async runSteps(steps: Step[]): Promise<string> {

        Logger.info("RUN STEPS START", "SSH");

        this.result = "";

        for (const step of steps) {

            const command =
                typeof step.command === "function"
                    ? step.command()
                    : step.command;

            // 1. esperar prompt ANTES
            const before = await this.waitFor(step.wait);

            Logger.info(`BEFORE CMD: ${before}`, "SSH");

            // 2. enviar comando
            await this.send(command);

            // 3. 🔥 ESPERAR RESPUESTA COMPLETA (CLAVE)
            const after = await this.waitFor(step.wait);

            Logger.info(`AFTER CMD: ${after}`, "SSH");

            // 4. acumular output REAL
            this.result += after;

        }

        Logger.success("RUN STEPS END", "SSH");

        return this.result;
    }

    public async runCommand(command: string): Promise<string> {

        while (this.isRunning) {
            await new Promise(r => setTimeout(r, 10));
        }

        this.isRunning = true;

        try {

            Logger.info(`[SSH] EXEC COMMAND: ${command}`);

            const start = this.buffer.length;

            await this.send(command);

            await this.waitForStablePrompt();

            const output = this.buffer.slice(start);

            Logger.info(`[SSH] RAW OUTPUT: ${output}`);

            return this.cleanAnsi(output);

        } finally {
            this.isRunning = false;
        }
    }

    private async waitForStablePrompt(): Promise<void> {

        let stable = 0;

        return new Promise((resolve) => {

            const check = () => {

                const isPrompt = /[#>$]\s*$/.test(this.buffer.trim());

                stable = isPrompt ? stable + 1 : 0;

                if (stable >= 5) {
                    resolve();
                    return;
                }

                setTimeout(check, 20);
            };

            check();
        });
    }


    // public async runCommand(command: string): Promise<string> {

    //     Logger.info(`[SSH] EXEC COMMAND: ${command}`);

    //     this.buffer = "";

    //     await this.send(command);

    //     await this.waitFor(/[#>$]\s*$/);

    //     Logger.info(`[SSH] AFTER CMD: ${this.buffer}`);

    //     return this.buffer.trim();
    // }

    // =====================================================
    // CLEAN ANSI
    // =====================================================

    protected cleanAnsi(text: string): string {

        return text
            .replace(/\x1b\[[0-9;]*[A-Za-z]/g, "")
            .replace(/\x1b7/g, "")
            .replace(/\x1b8/g, "")
            .replace(/\r/g, "");
        // .replace(/\x1b\[[0-9;]*[A-Za-z]/g, "")
        // .replace(/\x1b7/g, "")
        // .replace(/\x1b8/g, "")
        // .replace(/^[^\n]*\n/, "")
        // .replace(/\r/g, "")
        // .trim();

    }

    // =====================================================
    // CLOSE
    // =====================================================
    public close(): Promise<void> {

        return new Promise((resolve) => {

            try {
                this.stream?.end();
            } catch { }

            try {
                this.conn.end();
            } catch { }

            Logger.warn("SSH cerrado", "SSH");

            resolve();

        });

    }
}