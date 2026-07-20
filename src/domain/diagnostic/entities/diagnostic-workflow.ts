import type { WorkflowStatus } from "../enums/workflow-status.enum.js";
import type { WorkflowStep } from "../enums/workflow-step.enum.js";

export interface DiagnosticWorkflow {

    status: WorkflowStatus;

    currentStep: WorkflowStep | null;

    stopExecution: boolean;

}