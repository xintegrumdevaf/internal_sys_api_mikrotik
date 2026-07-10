export interface CommandHistory {
    step: string;
    command: string;
    raw: string;
    success: boolean;
    error?: string;
}