import type { WorkflowContext } from "../workflow.context.js";

export interface IWorkflowHandler {

    supports(
        context: WorkflowContext
    ): boolean;

    execute(
        context: WorkflowContext
    ): Promise<void>;

}