import { Logger } from "../../../shared/utils/logger.js";
import type { IWorkflowHandler } from "./interfaces/iworkflow.handler.js";
import type { WorkflowContext } from "./workflow.context.js";

export class WorkflowEngine {

    constructor(

        private readonly handlers: IWorkflowHandler[]

    ) {

        Logger.info(`HANDLERS: ${JSON.stringify(handlers)}`)
    }

    async execute(
        context: WorkflowContext
    ) {

        const handler =

            this.handlers.find(

                h => h.supports(context)

            );

        if (!handler) {

            throw new Error(

                "Workflow handler not found"

            );

        }

        await handler.execute(context);

    }

}