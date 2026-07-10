import type { CommandHistory } from "./command-history.js";

export class AdapterExecutionError extends Error {

    constructor(
        message: string,
        public readonly history: CommandHistory[]
    ) {
        super(message);
    }

}