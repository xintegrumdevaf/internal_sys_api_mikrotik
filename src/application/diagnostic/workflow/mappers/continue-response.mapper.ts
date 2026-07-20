

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
                context.session.status === "COMPLETED",


            instruction:
                context.instruction ?? "",


            finished:
                context.finished

        };

    }

}