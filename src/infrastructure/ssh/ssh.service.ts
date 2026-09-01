import { Client, type ClientChannel, type ConnectConfig } from "ssh2"
import { Logger } from "../../shared/utils/logger.js"
import type { Step } from "../../domain/olt/entities/step.entity.js"
import type { CommandInteraction } from "../olt/session/command-interaction.js"

export interface SSHOptions {
  timeout?: number
}

export interface WaitMatch {
  name: string
  output: string
  continue: boolean
}

export interface WaitCondition {
  name: string
  regex: RegExp
  continue?: boolean
  send?: string | (() => string)
}

type Waiter =
  | undefined
  | {
      regex: RegExp
      resolve: (value: string) => void
      reject: (err: Error) => void
      timeout: NodeJS.Timeout
    }

export class SSHService {
  private conn: Client
  private stream!: ClientChannel
  private readonly config: ConnectConfig
  private readonly timeout: number

  private output = ""
  private buffer = ""
  private result = ""
  private commandBuffer = ""

  private waiter?: Waiter
  private isRunning = false

  constructor(config: ConnectConfig, options?: SSHOptions) {
    this.conn = new Client()
    this.config = config
    this.timeout = options?.timeout ?? 30000
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conn
        .once("ready", () => {
          Logger.success("SSH conectado", "SSH")
          resolve()
        })
        .once("error", reject)
        .connect(this.config)
    })
  }

  public openShell(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.conn.shell(
        {
          term: "vt100",
          cols: 160,
          rows: 80
        },
        (err, stream) => {
          if (err) {
            reject(err)
            return
          }

          this.stream = stream
          Logger.success("Shell abierta", "SSH")

          stream.on("data", (chunk: Buffer) => {
            const txt = this.cleanAnsi(chunk.toString())
            this.output += txt
            this.buffer += txt
            this.commandBuffer += txt

            Logger.info(`DATA EVENT: ${JSON.stringify(txt)}`, "SSH")

            this.checkWaiter()
          })

          stream.on("error", (streamErr: unknown) => {
            Logger.error(`Error en stream SSH: ${String(streamErr)}`, "SSH")
          })

          stream.on("close", () => {
            Logger.warn("Shell cerrada", "SSH")
          })

          resolve()
        }
      )
    })
  }

  public waitFor(regex: RegExp): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout esperando ${regex}\nBUFFER:\n${this.commandBuffer}`))
      }, this.timeout)

      const check = (): void => {
        const match = this.commandBuffer.match(regex)
        if (match && match.index !== undefined) {
          clearTimeout(timeout)
          const out = this.commandBuffer.substring(0, match.index + match[0].length)
          resolve(out)
          return
        }
        setTimeout(check, 50)
      }

      check()
    })
  }

  public waitForAny(conditions: WaitCondition[]): Promise<WaitMatch> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout esperando condiciones\nBUFFER:\n${this.buffer}`))
      }, this.timeout)

      const check = (): void => {
        for (const condition of conditions) {
          const match = this.buffer.match(condition.regex)
          if (!match) continue

          clearTimeout(timeout)
          const index = this.buffer.indexOf(match[0])
          const out = this.buffer.substring(0, index + match[0].length)
          this.buffer = this.buffer.substring(index + match[0].length)

          Logger.success(`MATCH: ${condition.regex}`, "SSH")

          resolve({
            name: condition.name,
            output: out,
            continue: condition.continue ?? false
          })
          return
        }

        setTimeout(check, 20)
      }

      check()
    })
  }

  private checkWaiter(): void {
    if (!this.waiter) return
    const match = this.waiter.regex.test(this.buffer)
    if (!match) return

    clearTimeout(this.waiter.timeout)
    const value = this.buffer
    this.buffer = ""
    const resolve = this.waiter.resolve
    this.waiter = undefined
    resolve(value)
  }

  public send(command: string, ending = "\r"): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = command + ending
      Logger.info(`SEND: ${JSON.stringify(payload)}`, "SSH")
      this.stream.write(payload, err => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  public sendRaw(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stream.write(data, err => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  public async runSteps(steps: Step[]): Promise<string> {
    Logger.info("RUN STEPS START", "SSH")
    this.result = ""
    if (!steps.length) return this.result

    const firstStep = steps[0]
    if (firstStep) {
      await this.waitFor(firstStep.expect)
    }

    for (const step of steps) {
      const command = typeof step.command === "function" ? step.command() : step.command
      Logger.info(`COMMAND: ${command}`, "SSH")
      if (command) {
        await this.send(command)
      }

      const match = await this.waitForAny(step.success)
      Logger.info(`RESULT: ${match.name}\n${match.output}`, "SSH")
      this.result += match.output

      if (match.continue === false) {
        Logger.error(`SSH step fallido: ${match.name}`, "SSH")
        throw new Error(`SSH step failed: ${match.name}`)
      }
    }

    Logger.success("RUN STEPS END", "SSH")
    return this.result
  }

  public async runCommand(command: string, interactions?: CommandInteraction[]): Promise<string> {
    while (this.isRunning) {
      await new Promise(r => setTimeout(r, 10))
    }

    this.isRunning = true

    try {
      this.commandBuffer = ""
      this.buffer = ""

      await this.send(command)

      if (interactions?.length) {
        let finished = false

        while (!finished) {
          const result = await this.waitForAny([
            ...interactions.map(i => ({
              name: "interaction",
              regex: i.wait
            })),
            {
              name: "prompt",
              regex: /(?:\([^)]+\))?[>#]\s*$/
            }
          ])

          if (result.name === "prompt") {
            finished = true
            break
          }

          const interaction = interactions.find(i => i.wait.test(result.output))
          if (interaction) {
            const sendVal = typeof interaction.send === "function" ? interaction.send() : interaction.send
            await this.sendRaw(sendVal === "" ? "\r" : sendVal)
          }
        }
      } else {
        await this.waitForStablePrompt()
      }

      const output = this.cleanAnsi(this.commandBuffer)
      return output
    } finally {
      this.isRunning = false
    }
  }

  public async waitForStablePrompt(): Promise<void> {
    let stable = 0
    let pagerSent = false

    return new Promise((resolve, reject) => {
      const start = Date.now()

      const check = (): void => {
        if (Date.now() - start > this.timeout) {
          reject(new Error(`Timeout esperando prompt\nBUFFER:\n${this.buffer.slice(-1500)}`))
          return
        }

        const pager =
          this.commandBuffer.includes("Next Page") ||
          this.commandBuffer.includes("Next Entry") ||
          this.commandBuffer.includes("a All")

        if (pager && !pagerSent) {
          pagerSent = true
          this.stream.write("a")
          stable = 0
          setTimeout(check, 100)
          return
        }

        const prompt = /(?:\([^)]+\))?[>#]\s*$/.test(this.buffer.trim())
        if (prompt) {
          stable++
        } else {
          stable = 0
        }

        if (stable >= 5) {
          resolve()
          return
        }

        setTimeout(check, 50)
      }

      check()
    })
  }

  protected cleanAnsi(text: string): string {
    return text
      .replace(/\x1b\[[0-9;]*[A-Za-z]/g, "")
      .replace(/\x1b7/g, "")
      .replace(/\x1b8/g, "")
      .replace(/\r/g, "")
  }

  public getBuffer(): string {
    return this.buffer
  }

  public clearBuffer(): void {
    this.buffer = ""
  }

  public close(): Promise<void> {
    return new Promise(resolve => {
      try {
        this.stream?.end()
      } catch {}

      try {
        this.conn.end()
      } catch {}

      Logger.warn("SSH cerrado", "SSH")
      resolve()
    })
  }
}