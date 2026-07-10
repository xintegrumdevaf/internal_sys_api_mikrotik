import type { DiagnosticContext } from "../../../domain/diagnostic/value-objects/diagnostic.context.js";

export interface IDiagnosticAnalyzer {

    supports(context: DiagnosticContext): boolean

    analyze(context: DiagnosticContext): Promise<void>;

}