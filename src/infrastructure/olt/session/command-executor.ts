import type { OltSession } from "./olt.session.js";
import type { CommandHistory } from "./command-history.js";
import { AdapterExecutionError } from "./adapter-execution.error.js";
import type { CommandInteraction } from "./command-interaction.js";

export type Step<TCtx> = {
    step: keyof TCtx & string;

    command: (ctx: TCtx) => string | Promise<string>;

    parser?: (output: string, ctx: TCtx) => any;

    interactions?: CommandInteraction[];

    required?: boolean;
};


export class CommandExecutor {

    private readonly history: CommandHistory[] = [];

    constructor(
        private readonly session: OltSession
    ) { }

    // ------------------------
    // Overloads
    // ------------------------

    run(
        step: string,
        command: string
    ): Promise<void>;

    run<T>(
        step: string,
        command: string,
        parser: (text: string) => T
    ): Promise<T>;

    // ------------------------
    // Implementation
    // ------------------------

    async run<T>(
        step: string,
        command: string,
        parser?: (text: string) => T
    ): Promise<T | void> {

        const result = await this.session.execute(command);

        try {

            if (!parser) {

                this.history.push({
                    step,
                    command,
                    raw: result.output,
                    success: true
                });

                return;
            }

            const data = parser(result.output);

            this.history.push({
                step,
                command,
                raw: result.output,
                success: true
            });

            return data;

        } catch (e) {

            this.history.push({
                step,
                command,
                raw: result.output,
                success: false,
                error: e instanceof Error
                    ? e.message
                    : "Parser error"
            });

            throw new AdapterExecutionError(
                `Error ejecutando '${step}'`,
                [...this.history]
            );

        }

    }

    async runFlow<TContext extends Record<string, any>>(
        steps: Step<TContext>[]
    ): Promise<{
        context: TContext;
        history: CommandHistory[];
        failedStep?: string;
    }> {

        const history: CommandHistory[] = [];

        const context: any = {};

        for (const step of steps) {

            try {

                const command = await step.command(context);

                const result = await this.session.execute(command, step.interactions);

                const parsed = step.parser
                    ? step.parser(result.output, context)
                    : result.output;

                context[step.step] = parsed;

                history.push({
                    step: step.step,
                    command,
                    raw: result.output,
                    success: true
                });

            } catch (err) {

                history.push({
                    step: step.step,
                    command: "",
                    raw: "",
                    success: false,
                    error: err instanceof Error ? err.message : "error"
                });

                if (step.required) {
                    return {
                        context,
                        history,
                        failedStep: step.step
                    };
                }
            }
        }

        return {
            context,
            history
        };
    }

    fail(message: string): never {

        throw new AdapterExecutionError(
            message,
            [...this.history]
        );

    }

    getHistory(): CommandHistory[] {

        return [...this.history];

    }

}