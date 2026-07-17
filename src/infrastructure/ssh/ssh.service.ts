

import { Client, type ClientChannel, type ConnectConfig } from "ssh2";
import { Logger } from "../../shared/utils/logger.js";
import type { Step } from "../../domain/olt/entities/step.entity.js";
import type { CommandInteraction } from "../olt/session/command-interaction.js";

export interface SSHOptions {
    timeout?: number;
}

export interface WaitMatch {
    name: string;
    output: string;
    continue: boolean;
}

type Waiter = undefined | {
    regex: RegExp;
    resolve: (value: any) => void;
    reject: (err: Error) => void;
    timeout: NodeJS.Timeout;
};

export interface WaitCondition {
    name: string;
    regex: RegExp;
    continue?: boolean;
}

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

                        Logger.info(
                            `DATA EVENT: ${JSON.stringify(txt)}`,
                            "SSH"
                        );

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
    // public waitFor(regex: RegExp): Promise<void> {

    //     Logger.info(`WAIT FOR: ${regex}`, "SSH");

    //     return new Promise((resolve, reject) => {

    //         this.waiter = {
    //             regex,
    //             resolve: (value: any) => {
    //                 Logger.success(`MATCH: ${regex}`, "SSH");
    //                 resolve(value);
    //             },
    //             reject,
    //             timeout: setTimeout(() => {

    //                 const err = new Error(
    //                     `Timeout esperando ${regex}\nBUFFER:\n${this.buffer}`
    //                 );

    //                 Logger.error(err.message, "SSH");

    //                 this.waiter = undefined;

    //                 reject(err);

    //             }, this.timeout)
    //         };

    //         // 🔥 por si ya llegó el texto antes de esperar
    //         this.checkWaiter();

    //     });

    // }

    // public waitFor(regex: RegExp): Promise<string> {

    //     Logger.info(`WAIT FOR: ${regex}`, "SSH");

    //     return new Promise((resolve, reject) => {

    //         this.waiter = {
    //             regex,
    //             resolve: (value: string) => {

    //                 Logger.success(`MATCH: ${regex}`, "SSH");

    //                 resolve(value);

    //             },
    //             reject,
    //             timeout: setTimeout(() => {

    //                 const err = new Error(
    //                     `Timeout esperando ${regex}\nBUFFER:\n${this.buffer}`
    //                 );

    //                 Logger.error(err.message, "SSH");

    //                 this.waiter = undefined;

    //                 reject(err);

    //             }, this.timeout)
    //         };

    //         this.checkWaiter();

    //     });

    // }

    private waitFor(regex: RegExp): Promise<string> {

        return new Promise((resolve, reject) => {


            const timeout = setTimeout(() => {

                reject(
                    new Error(
                        `Timeout esperando ${regex}\nBUFFER:\n${this.commandBuffer}`
                    )
                );

            }, 30000);



            const check = () => {


                const match =
                    this.commandBuffer.match(regex);



                if (match) {


                    clearTimeout(timeout);


                    const output =
                        this.commandBuffer.substring(
                            0,
                            match.index! + match[0].length
                        );


                    // NO limpiar aquí
                    // this.commandBuffer = "";


                    resolve(output);


                    return;

                }


                setTimeout(check, 50);

            };


            check();

        });
    }

    // =====================================================
    // WAIT FOR (INTERVAL)
    // =====================================================
    // public async waitForAny(regexes: RegExp[]): Promise<number> {

    //     return new Promise((resolve, reject) => {

    //         const interval = setInterval(() => {

    //             for (let i = 0; i < regexes.length; i++) {

    //                 if (regexes[i]!.test(this.buffer)) {

    //                     clearInterval(interval);

    //                     resolve(i);

    //                     return;

    //                 }

    //             }

    //         }, 20);

    //         setTimeout(() => {

    //             clearInterval(interval);

    //             reject(new Error("Timeout"));

    //         }, this.timeout);

    //     });

    // }

    private waitForAny(
        conditions: {
            name: string;
            regex: RegExp;
            continue?: boolean;
            send?: string | (() => string);
        }[]
    ): Promise<{
        name: string;
        output: string;
        continue: boolean;
    }> {

        return new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {

                reject(
                    new Error(
                        `Timeout esperando condiciones\nBUFFER:\n${this.buffer}`
                    )
                );

            }, this.timeout);


            const check = () => {

                for (const condition of conditions) {

                    const match =
                        this.buffer.match(condition.regex);


                    if (!match) {
                        continue;
                    }


                    clearTimeout(timeout);


                    const index =
                        this.buffer.indexOf(match[0]);


                    const output =
                        this.buffer.substring(
                            0,
                            index + match[0].length
                        );


                    this.buffer =
                        this.buffer.substring(
                            index + match[0].length
                        );


                    Logger.success(
                        `MATCH: ${condition.regex}`,
                        "SSH"
                    );


                    resolve({

                        name: condition.name,

                        output,

                        continue:
                            condition.continue ?? false

                    });


                    return;

                }


                setTimeout(check, 20);

            };


            check();

        });
    }

    // =====================================================
    // CHECK WAITER
    // =====================================================

    // private checkWaiter(): void {

    //     if (!this.waiter) return;

    //     const match = this.waiter.regex.test(this.buffer);

    //     Logger.debug(`CHECK WAITER -> ${match}`, "SSH");

    //     if (match) {

    //         clearTimeout(this.waiter.timeout);

    //         const resolve = this.waiter.resolve;

    //         const value = this.buffer; // 👈 COPIA REAL

    //         this.waiter = undefined;

    //         resolve(value);

    //         return;
    //     }
    // }

    private checkWaiter(): void {

        if (!this.waiter) return;

        const match = this.waiter.regex.test(this.buffer);

        Logger.debug(`CHECK WAITER -> ${match}`, "SSH");

        if (!match) return;

        clearTimeout(this.waiter.timeout);

        const value = this.buffer;

        // Consumir el buffer
        this.buffer = "";

        const resolve = this.waiter.resolve;

        this.waiter = undefined;

        resolve(value);

    }

    // =====================================================
    // SEND
    // =====================================================
    // public send(command: string): Promise<void> {

    //     return new Promise((resolve, reject) => {

    //         Logger.info(`SEND: ${command}`, "SSH");

    //         this.stream.write(command + "\r\n", (err) => {

    //             if (err) {
    //                 reject(err);
    //                 return;
    //             }

    //             resolve();

    //         });

    //     });

    // }

    // public send(command: string, ending = "\r\n"): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         Logger.info(`SEND: ${JSON.stringify(command + ending)}`, "SSH");

    //         this.stream.write(command + ending, err => {
    //             if (err) return reject(err);
    //             resolve();
    //         });
    //     });
    // }

    // public send(command: string): Promise<void> {

    //     return new Promise((resolve, reject) => {

    //         Logger.info(`SEND: ${JSON.stringify(command)}`, "SSH");

    //         this.stream.write(command + "\r\n", err => {

    //             if (err) {
    //                 reject(err);
    //                 return;
    //             }

    //             resolve();

    //         });

    //     });

    // }

    public send(
        command: string,
        ending = "\r"
    ): Promise<void> {

        return new Promise((resolve, reject) => {

            const payload = command + ending;

            Logger.info(
                `SEND: ${JSON.stringify(payload)}`,
                "SSH"
            );

            this.stream.write(payload, (err) => {

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

    // public async runSteps(steps: Step[]): Promise<string> {

    //     Logger.info("RUN STEPS START", "SSH");

    //     this.result = "";

    //     for (const step of steps) {

    //         const command =
    //             typeof step.command === "function"
    //                 ? step.command()
    //                 : step.command;

    //         // 1. esperar prompt ANTES
    //         const before = await this.waitFor(step.wait);

    //         Logger.info(`BEFORE CMD: ${before}`, "SSH");

    //         // 2. enviar comando
    //         await this.send(command);

    //         // 3. 🔥 ESPERAR RESPUESTA COMPLETA (CLAVE)
    //         const after = await this.waitFor(step.wait);

    //         Logger.info(`AFTER CMD: ${after}`, "SSH");

    //         // 4. acumular output REAL
    //         this.result += after;

    //     }

    //     Logger.success("RUN STEPS END", "SSH");

    //     return this.result;
    // }

    // public async runSteps(steps: Step[]): Promise<string> {

    //     Logger.info("RUN STEPS START", "SSH");

    //     this.result = "";

    //     for (const step of steps) {

    //         // Esperar el estado esperado
    //         const before = await this.waitFor(step.expect);

    //         Logger.info(`EXPECT:\n${before}`, "SSH");

    //         const command =
    //             typeof step.command === "function"
    //                 ? step.command()
    //                 : step.command;

    //         Logger.info(`COMMAND: ${command}`, "SSH");

    //         // Enviar comando
    //         await this.send(command!);

    //         // Esperar la respuesta esperada
    //         const after = await this.waitFor(step.success);

    //         Logger.info(`SUCCESS:\n${after}`, "SSH");

    //         this.result += after;

    //     }

    //     Logger.success("RUN STEPS END", "SSH");

    //     return this.result;

    // }

    public async runSteps(steps: Step[]): Promise<string> {

        Logger.info("RUN STEPS START", "SSH");

        this.result = "";

        if (!steps.length) {
            return this.result;
        }

        // Esperar el estado inicial
        await this.waitFor(steps[0]!.expect);

        for (const step of steps) {

            const command =
                typeof step.command === "function"
                    ? step.command()
                    : step.command;

            Logger.info(`COMMAND: ${command}`, "SSH");

            await this.send(command);

            const match = await this.waitForAny(step.success);

            Logger.info(
                `RESULT: ${match.name}\n${match.output}`,
                "SSH"
            );

            this.result += match.output;


            // Si el resultado no es el esperado para continuar
            if (match.continue === false) {

                Logger.error(
                    `STEP FAILED: ${match.name}`,
                    "SSH"
                );

                throw new Error(
                    `SSH step failed: ${match.name}`
                );
            }
        }

        Logger.success("RUN STEPS END", "SSH");

        return this.result;
    }

    // public async runCommand(command: string, interactions?: CommandInteraction[]
    // ): Promise<string> {

    //     this.commandBuffer = "";

    //     while (this.isRunning) {
    //         await new Promise(r => setTimeout(r, 10));
    //     }

    //     this.isRunning = true;

    //     try {

    //         Logger.info(`[SSH] EXEC COMMAND: ${command}`);

    //         const start = this.buffer.length;

    //         await this.send(command);

    //         await this.waitForStablePrompt();

    //         const output = this.buffer.slice(start);

    //         Logger.info(`[SSH] RAW OUTPUT: ${output}`);

    //         return this.cleanAnsi(output);

    //     } finally {
    //         this.isRunning = false;
    //     }
    // }

    // public async runCommand(
    //     command: string,
    //     interactions?: CommandInteraction[]
    // ): Promise<string> {

    //     this.commandBuffer = "";

    //     while (this.isRunning) {
    //         await new Promise(r => setTimeout(r, 10));
    //     }

    //     this.isRunning = true;

    //     try {

    //         Logger.info(`[SSH] EXEC COMMAND: ${command}`);

    //         const start = this.buffer.length;

    //         // 1. Enviar comando
    //         await this.send(command);

    //         // 2. Resolver interacciones si existen
    //         if (interactions?.length) {

    //             for (const interaction of interactions) {

    //                 Logger.info(
    //                     `[SSH] Esperando interacción: ${interaction.wait}`,
    //                     "SSH"
    //                 );

    //                 await this.waitFor(interaction.wait);

    //                 const data =
    //                     typeof interaction.send === "function"
    //                         ? interaction.send()
    //                         : interaction.send;

    //                 Logger.info(
    //                     `[SSH] Enviando interacción: ${JSON.stringify(data)}`,
    //                     "SSH"
    //                 );

    //                 // Si es Enter vacío no queremos enviar "\n\n"
    //                 if (data === "") {
    //                     this.stream.write("\r");
    //                 } else {
    //                     this.stream.write(data + "\r");
    //                 }
    //             }

    //         }

    //         // 3. Esperar el prompt final
    //         await this.waitForStablePrompt();

    //         const output = this.buffer.slice(start);

    //         Logger.info(`[SSH] RAW OUTPUT:\n${output}`);

    //         return this.cleanAnsi(output);

    //     } finally {

    //         this.isRunning = false;

    //     }
    // }

    // public async runCommand(
    //     command: string,
    //     interactions?: CommandInteraction[]
    // ): Promise<string> {

    //     while (this.isRunning) {
    //         await new Promise(r => setTimeout(r, 10));
    //     }

    //     this.isRunning = true;

    //     let output = "";

    //     try {

    //         Logger.info(`[SSH] EXEC COMMAND: ${command}`, "SSH");


    //         this.commandBuffer = "";


    //         await this.send(command);



    //         // if (interactions?.length) {


    //         //     for (const interaction of interactions) {


    //         //         Logger.info(
    //         //             `[SSH] Esperando interacción: ${interaction.wait}`,
    //         //             "SSH"
    //         //         );


    //         //         const before =
    //         //             await this.waitFor(interaction.wait);


    //         //         Logger.info(
    //         //             `[SSH] INTERACTION FOUND:\n${before}`,
    //         //             "SSH"
    //         //         );


    //         //         output += before;



    //         //         const data =
    //         //             typeof interaction.send === "function"
    //         //                 ? interaction.send()
    //         //                 : interaction.send;



    //         //         Logger.info(
    //         //             `[SSH] Enviando interacción: ${JSON.stringify(data)}`,
    //         //             "SSH"
    //         //         );



    //         //         if (data === "") {

    //         //             await this.sendRaw("\r");

    //         //         } else {

    //         //             await this.sendRaw(data + "\r");

    //         //         }


    //         //         // darle tiempo a Huawei para responder
    //         //         await new Promise(r => setTimeout(r, 300));

    //         //     }

    //         // }

    //         if (interactions?.length) {

    //             for (const interaction of interactions) {

    //                 const data =
    //                     await this.waitFor(interaction.wait);

    //                 output += data;


    //                 const send =
    //                     typeof interaction.send === "function"
    //                         ? interaction.send()
    //                         : interaction.send;


    //                 Logger.info(
    //                     `[SSH] Enviando interacción: ${JSON.stringify(send)}`,
    //                     "SSH"
    //                 );


    //                 if (send === "") {
    //                     await this.sendRaw("\r");
    //                 } else {
    //                     await this.sendRaw(send + "\r");
    //                 }

    //             }
    //         }



    //         const response =
    //             await this.waitForStablePrompt();



    //         output += response;



    //         Logger.info(
    //             `[SSH] RAW OUTPUT:\n${output}`,
    //             "SSH"
    //         );



    //         return this.cleanAnsi(output);



    //     } finally {

    //         this.isRunning = false;

    //     }
    // }

    public async runCommand(
        command: string,
        interactions?: CommandInteraction[]
    ): Promise<string> {

        while (this.isRunning) {
            await new Promise(r => setTimeout(r, 10));
        }

        this.isRunning = true;

        try {

            Logger.info(
                `[SSH] EXEC COMMAND: ${command}`,
                "SSH"
            );


            this.commandBuffer = "";
            this.buffer = "";


            Logger.info(
                `[SSH] SEND: ${JSON.stringify(command)}`,
                "SSH"
            );


            await this.send(command);



            /*
             * COMANDOS CON INTERACCIONES
             * Ej:
             * Huawei:
             * { <cr>|ont<K>||<K> }:
             * ---- More ( Press 'Q' to break ) ----
             *
             * VSOL:
             * cualquier paginación o confirmación
             */
            if (interactions?.length) {


                let finished = false;


                while (!finished) {


                    const result =
                        await this.waitForAny([


                            ...interactions.map(i => ({
                                name: "interaction",
                                regex: i.wait
                            })),


                            // Huawei MA5800
                            {
                                name: "prompt",
                                regex:
                                    /[A-Za-z0-9_-]+\(.*?\)[>#]\s*$/
                            }


                        ]);



                    Logger.info(
                        `[SSH] MATCH RESULT: ${result.name}`,
                        "SSH"
                    );



                    /*
                     * Si encontró prompt terminó
                     */
                    if (result.name === "prompt") {

                        finished = true;
                        break;

                    }



                    /*
                     * Encontró interacción
                     */
                    const interaction =
                        interactions.find(i =>
                            i.wait.test(
                                result.output ?? ""
                            )
                        );



                    if (interaction) {


                        const send =
                            typeof interaction.send === "function"
                                ? interaction.send()
                                : interaction.send;



                        Logger.info(
                            `[SSH] Enviando interacción: ${JSON.stringify(send)}`,
                            "SSH"
                        );



                        await this.sendRaw(
                            send === ""
                                ? "\r"
                                : send
                        );

                    }

                }


            } else {


                /*
                 * Sin interacciones:
                 * espera prompt estable
                 */
                await this.waitForStablePrompt();

            }



            /*
             * IMPORTANTE:
             * NO usar result.output
             * porque puede venir undefined.
             *
             * La fuente real es commandBuffer
             */
            const output =
                this.cleanAnsi(
                    this.commandBuffer
                );



            Logger.info(
                `[SSH] RAW OUTPUT:\n${output}`,
                "SSH"
            );



            return output;



        } finally {

            this.isRunning = false;

        }
    }
    public sendRaw(data: string): Promise<void> {

        return new Promise((resolve, reject) => {


            Logger.info(
                `SEND RAW: ${JSON.stringify(data)}`,
                "SSH"
            );


            this.stream.write(
                data,
                err => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();

                }
            );

        });

    }

    private async waitForCommandResponse(): Promise<string> {

        const before = this.commandBuffer.length;


        await this.waitForStablePrompt();


        return this.commandBuffer.slice(before);

    }

    // private async waitForStablePrompt(): Promise<void> {

    //     let stable = 0;

    //     return new Promise((resolve) => {

    //         const check = () => {

    //             const isPrompt = /[#>$]\s*$/.test(this.buffer.trim());

    //             stable = isPrompt ? stable + 1 : 0;

    //             if (stable >= 5) {
    //                 resolve();
    //                 return;
    //             }

    //             setTimeout(check, 20);
    //         };

    //         check();
    //     });
    // }

    // private async waitForStablePrompt(): Promise<void> {

    //     let stable = 0;
    //     let pagerSent = false;

    //     return new Promise((resolve, reject) => {

    //         const start = Date.now();


    //         const check = () => {


    //             // timeout de seguridad
    //             if (Date.now() - start > this.timeout) {

    //                 reject(
    //                     new Error(
    //                         `Timeout esperando prompt\nBUFFER:\n${this.buffer.slice(-1000)}`
    //                     )
    //                 );

    //                 return;
    //             }



    //             /**
    //              * Detecta paginador sin casarse con una OLT
    //              */
    //             const pager =
    //                 /CTRL\+C.*?Quit.*?SPACE.*?Next Page.*?ENTER.*?Next Entry.*?a\s+All/is
    //                     .test(this.commandBuffer);


    //             if (pager && !pagerSent) {

    //                 pagerSent = true;

    //                 Logger.info(
    //                     "[SSH] Pager detectado -> enviando ALL",
    //                     "SSH"
    //                 );

    //                 this.stream.write("a\r");

    //                 stable = 0;

    //                 setTimeout(check, 1000);

    //                 return;
    //             }



    //             /**
    //              * Prompt genérico
    //              *
    //              * Ejemplos:
    //              * SOLES(config)>
    //              * BICENTENARIO>
    //              * ONU(config)#
    //              * >
    //              */
    //             const isPrompt =
    //                 /[>#>]\s*$/.test(this.buffer.trim());



    //             stable = isPrompt
    //                 ? stable + 1
    //                 : 0;



    //             if (stable >= 5) {

    //                 resolve();

    //                 return;
    //             }


    //             setTimeout(check, 100);

    //         };


    //         check();

    //     });
    // }

    private async waitForStablePrompt(): Promise<void> {

        let stable = 0;
        let pagerSent = false;

        return new Promise((resolve, reject) => {

            const start = Date.now();

            const check = () => {

                // Timeout de seguridad
                if (Date.now() - start > this.timeout) {

                    reject(
                        new Error(
                            `Timeout esperando prompt\nBUFFER:\n${this.buffer.slice(-1500)}`
                        )
                    );

                    return;
                }


                /**
                 * Detectar paginador
                 *
                 * No dependemos del texto completo porque puede venir
                 * dividido en varios chunks.
                 */
                const pager =
                    this.commandBuffer.includes("Next Page") ||
                    this.commandBuffer.includes("Next Entry") ||
                    this.commandBuffer.includes("a All");


                if (pager && !pagerSent) {

                    pagerSent = true;

                    Logger.info(
                        "[SSH] Pager detectado -> enviando tecla 'a'",
                        "SSH"
                    );

                    // IMPORTANTE:
                    // solo la tecla, sin ENTER
                    this.stream.write("a");

                    stable = 0;

                    // Dar tiempo a que la OLT empiece a imprimir
                    setTimeout(check, 100);

                    return;
                }


                /**
                 * Prompt genérico
                 *
                 * SOLES(config)>
                 * BICENTENARIO(config)>
                 * OLT#
                 * >
                 */
                const prompt =
                    /(?:\([^)]+\))?[>#]\s*$/.test(
                        this.buffer.trim()
                    );


                if (prompt) {
                    stable++;
                } else {
                    stable = 0;
                }


                // Debe permanecer estable varios ciclos
                if (stable >= 5) {
                    resolve();
                    return;
                }

                setTimeout(check, 50);

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

    public getBuffer(): string {
        return this.buffer;
    }

    public clearBuffer(): void {
        this.buffer = "";
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