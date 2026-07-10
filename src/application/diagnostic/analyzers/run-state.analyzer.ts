import { ActionType } from "../../../domain/diagnostic/enums/action.type.js";
import { FindingType } from "../../../domain/diagnostic/enums/finding.type.js";
import type { DiagnosticContext } from "../../../domain/diagnostic/value-objects/diagnostic.context.js";
import { DiagnosticMessages } from "../catalog/diagnostic-messages.catalog.js";
import { DiagnosticRules } from "../catalog/diagnostic-rules.catalog.js";
import type { IDiagnosticAnalyzer } from "../interfaces/idiagnostic.analyzer.js";

export class RunStateAnalyzer implements IDiagnosticAnalyzer {
    supports(context: DiagnosticContext): boolean {
        return context.technical.state != null
    }

    async analyze(context: DiagnosticContext): Promise<void> {
        const runState = context.technical.state.runState

        if (runState?.toLowerCase() !== DiagnosticRules.runState.offline.toLowerCase()) {
            return;
        }

        context.fail(FindingType.ONU_OFFLINE, ActionType.REQUEST_MEDIA)
    }

}
