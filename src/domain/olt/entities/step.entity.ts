export interface Step {
    expect: RegExp;
    command: string | (() => string);
    success: StepResult[];
}

export interface StepResult {
    name: string;
    regex: RegExp;
    continue: boolean
}