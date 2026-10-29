import { DomainError } from "../../../shared/errors/domain-error.js";

export class OltAuthError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = "OltAuthError";
  }
}
