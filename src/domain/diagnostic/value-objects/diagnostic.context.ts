import { ActionPriorityCatalog } from "../map/action-priority.map.js";
import { DiagnosticInstructions } from "../instructions/diagnostic.instructions.js";
import { FindingCatalog } from "../definitions/finding.definitions.js";
import { WorkflowCatalog } from "../definitions/workflow.definitions.js";
import type { TechnicalDataResponseDTO } from "../../../application/olt/dto/technical-data.response.dto.js";

import type { DiagnosticAction } from "../entities/diagnostic.action.js";
import type { DiagnosticFinding } from "../entities/diagnostic.finding.js";

import type { ActionType } from "../enums/action.type.js";
import { DiagnosticStatus } from "../enums/diagnostic.status.js";
import type { FindingType } from "../enums/finding.type.js";
import { WorkflowStatus } from "../enums/workflow-status.enum.js";
import type { WorkflowStep } from "../enums/workflow-step.enum.js";


export class DiagnosticContext {

    constructor(
        public readonly technical: TechnicalDataResponseDTO
    ) { }

    status = DiagnosticStatus.SUCCESS;

    findings: DiagnosticFinding[] = [];

    actions: DiagnosticAction[] = [];

    instruction: string | null = null;

    workflow = {
        status: WorkflowStatus.COMPLETED,
        currentStep: null as WorkflowStep | null,
        stopExecution: false
    };

    addFinding(
        finding: DiagnosticFinding
    ) {

        const exists =
            this.findings.some(f => f.type === finding.type);

        if (!exists) {
            this.findings.push(finding);
        }

        if (finding.stopExecution) {
            this.workflow.stopExecution = true;
        }

    }

    addAction(action: DiagnosticAction) {

        const exists =
            this.actions.some(a => a.type === action.type);

        if (exists) {
            return;
        }

        this.actions.push(action);

        const workflow =
            WorkflowCatalog[action.type];

        if (!workflow) {
            return;
        }

        this.workflow.status =
            workflow.status;

        this.workflow.currentStep =
            workflow.step;

        this.workflow.stopExecution =
            workflow.stop;

    }

    setInstruction(
        instruction: string
    ) {

        this.instruction = instruction;

    }

    waitUser(
        step: WorkflowStep
    ) {

        this.workflow.status = WorkflowStatus.WAITING_USER;
        this.workflow.currentStep = step;
        this.workflow.stopExecution = true;

    }

    waitSystem(
        step: WorkflowStep
    ) {

        this.workflow.status = WorkflowStatus.WAITING_SYSTEM;
        this.workflow.currentStep = step;
        this.workflow.stopExecution = true;

    }

    complete() {

        this.workflow.status = WorkflowStatus.COMPLETED;
        this.workflow.currentStep = null;
        this.workflow.stopExecution = true;

    }

    setStatus(
        status: DiagnosticStatus
    ) {

        const priority = {

            SUCCESS: 0,

            WARNING: 1,

            FAILED: 2,

            CRITICAL: 3

        };

        if (priority[status] > priority[this.status]) {
            this.status = status;
        }

    }

    report(
        finding: FindingType,
        action?: ActionType
    ) {

        const settings =
            FindingCatalog[finding];

        this.addFinding({

            type: finding,

            severity: settings.severity,

            stopExecution: settings.stopExecution,

            description: finding

        });

        if (action) {

            this.addAction({

                priority: ActionPriorityCatalog[action],

                type: action,

                stopExecution: settings.stopExecution

            });

        }

        const instruction =
            DiagnosticInstructions[finding];

        if (instruction) {
            this.setInstruction(instruction);
        }

        this.setStatus(settings.status);

    }

    shouldStop() {

        return this.workflow.stopExecution;

    }

}