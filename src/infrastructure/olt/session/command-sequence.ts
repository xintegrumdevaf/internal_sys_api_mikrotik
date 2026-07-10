import type { CommandStep } from "./command-step.js";

export interface CommandSequence {
    steps: CommandStep[];
}