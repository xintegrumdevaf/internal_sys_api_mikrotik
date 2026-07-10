export interface Step {

    wait: RegExp;

    command: string | (() => string);

}