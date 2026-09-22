

import { WorkflowStatus } from "../../../../domain/diagnostic/enums/workflow-status.enum.js";
import type { ContinueDiagnosticResponseDTO } from "../../dto/continue-response.dto.js";
import type { WorkflowContext }
    from "../workflow.context.js";


export class ContinueResponseMapper {


    static toResponse(
        context: WorkflowContext
    ): ContinueDiagnosticResponseDTO {


        return {

            success: true,


            status:
                context.session.status,


            currentStep:
                context.session.currentStep,


            stopExecution:
                context.session.status === WorkflowStatus.COMPLETED || context.finished,


            instruction:
                context.instruction ?? "",


            finished:
                context.finished

        };

    }

}