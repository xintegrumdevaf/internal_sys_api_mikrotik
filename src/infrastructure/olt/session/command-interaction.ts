export interface CommandInteraction {

    wait: RegExp;

    send: string | (() => string);

    repeat?: boolean;

}