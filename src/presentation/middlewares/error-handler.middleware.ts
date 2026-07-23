import type { Request, Response, NextFunction } from "express"
import { DomainError } from "../../shared/errors/domain-error.js"
import { ApplicationError } from "../../shared/errors/application-error.js"
import { Logger } from "../../shared/utils/logger.js"
import { ValidationError } from "../validators/validation-error.js"

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction): void {
  Logger.error(`${error.name}: ${error.message}`)

  if (error instanceof ValidationError) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: error.message,
      fields: error.fields
    })
    return
  }

  if (error instanceof DomainError) {
    res.status(422).json({
      code: error.code,
      message: error.message
    })
    return
  }

  if (error instanceof ApplicationError) {
    res.status(400).json({
      code: error.code,
      message: error.message
    })
    return
  }

  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor"
  })
}
