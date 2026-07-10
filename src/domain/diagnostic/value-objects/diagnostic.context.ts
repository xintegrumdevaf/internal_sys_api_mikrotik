import { ActionPriorityCatalog } from "../../../application/diagnostic/catalog/action-priority.catalog.js";
import { FindingCatalog } from "../../../application/diagnostic/catalog/finding.catalog.js";
import type { TechnicalDataResponseDTO } from "../../../application/olt/dto/technical-data.response.dto.js";
import type { DiagnosticAction } from "../entities/diagnostic.action.js";
import type { DiagnosticFinding } from "../entities/diagnostic.finding.js";
import type { DiagnosticMessage } from "../entities/diagnostic.message.js";
import type { ActionType } from "../enums/action.type.js";
import { DiagnosticStatus } from "../enums/diagnostic.status.js";
import type { FindingType } from "../enums/finding.type.js";
import { Severity } from "../enums/severity.js";

export class DiagnosticContext {
    constructor(public readonly technical: TechnicalDataResponseDTO) { }

    status = DiagnosticStatus.SUCCESS;

    findings: DiagnosticFinding[] = [];

    actions: DiagnosticAction[] = [];

    // messages: DiagnosticMessage[] = []

    addFinding(finding: DiagnosticFinding) {
        const exists = this.findings.some(f => f.type == finding.type)

        if (!exists) {
            this.findings.push(finding)
        }
    }

    addAction(
        action: DiagnosticAction
    ) {

        const exists =
            this.actions.some(

                a => a.type === action.type

            );

        if (!exists) {

            this.actions.push(action);

        }

    }

    // addMessage(
    //     message: DiagnosticMessage
    // ) {

    //     this.messages.push(message);

    // }

    setStatus(status: DiagnosticStatus) {
        const priority = {
            SUCCESS: 0,

            WARNING: 1,

            FAILED: 2,

            CRITICAL: 3
        }

        if (priority[status] > priority[this.status]) {
            this.status = status
        }
    }



    fail(finding: FindingType, action: ActionType) {
        const findingSettings = FindingCatalog[finding]
        const { severity, stopExecution } = findingSettings

        this.addFinding({

            type: finding,
            severity,
            stopExecution,
            description: finding

        });

        if (action) {
            const priority = ActionPriorityCatalog[action]

            this.addAction({
                priority,
                type: action,
                // stopExecution: false
            })
        }

        this.setStatus(DiagnosticStatus.FAILED)


    }

    warn(finding: FindingType, action: ActionType) {
        const findingSettings = FindingCatalog[finding]
        const { severity, stopExecution } = findingSettings

        this.addFinding({

            type: finding,
            severity,
            stopExecution,
            description: finding

        });

        if (action) {
            const priority = ActionPriorityCatalog[action]

            this.addAction({
                priority,
                type: action,
                // stopExecution: false
            });

        }

        this.setStatus(
            DiagnosticStatus.WARNING
        );
    }

    critical(finding: FindingType, action: ActionType) {
        const findingSettings = FindingCatalog[finding]
        const { severity, stopExecution } = findingSettings

        this.addFinding({

            type: finding,
            severity,
            stopExecution,
            description: finding

        });

        if (action) {
            const priority = ActionPriorityCatalog[action]

            this.addAction({
                priority,
                type: action,
                // stopExecution: false

            });

        }

        this.setStatus(
            DiagnosticStatus.CRITICAL
        );
    }

    success(action: ActionType) {
        if (action) {
            const priority = ActionPriorityCatalog[action]

            this.addAction({
                priority,
                type: action,
                // stopExecution: false

            });

        }

        this.setStatus(
            DiagnosticStatus.SUCCESS
        );
    }

    shouldStop() {
        return this.findings.some(f => f.stopExecution)
    }
}