import type { MessageType } from "../enums/message.type.js";

export interface DiagnosticMessage {

    type: MessageType;

    text: string;

}