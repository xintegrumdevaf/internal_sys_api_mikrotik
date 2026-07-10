export interface CommandStep<T = unknown> {
    name: string;
    command: string;
    raw: string;
    data?: T;
    success: boolean;
    error?: string;
}