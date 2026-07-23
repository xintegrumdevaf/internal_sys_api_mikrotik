import { ActionType } from "../../../domain/diagnostic/enums/action.type.js";
import { FindingType } from "../../../domain/diagnostic/enums/finding.type.js";
import type { DiagnosticContext } from "../../../domain/diagnostic/value-objects/diagnostic.context.js";
import { Logger } from "../../../shared/utils/logger.js";
import type { IDiagnosticAnalyzer } from "../interfaces/idiagnostic.analyzer.js";

export class OnuAnalyzer implements IDiagnosticAnalyzer {
    supports(context: DiagnosticContext): boolean {
        return true;
    }

    async analyze(context: DiagnosticContext): Promise<void> {
        const onu = context?.technical?.onu

        if (onu) {
            return;
        }

        context.report(FindingType.ONT_NOT_AVAILABLE, ActionType.HOOK_USER_DEVICE)
    }

}
