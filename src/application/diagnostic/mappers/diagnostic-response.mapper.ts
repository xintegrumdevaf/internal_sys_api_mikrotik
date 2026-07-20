import type { DiagnosticContext } from "../../../domain/diagnostic/value-objects/diagnostic.context.js";
import type { DiagnosticResponseDTO } from "../dto/diagnostic.response.dto.js";

export class DiagnosticResponseMapper {

    static toResponse(
        diagnostic: DiagnosticContext
    ): DiagnosticResponseDTO {

        return {

            success: true,

            diagnostic: {

                status: diagnostic.status,

                findings: diagnostic.findings,

                actions: diagnostic.actions

            },

            workflow: diagnostic.workflow,

            instruction: diagnostic.instruction,

            technical: diagnostic.technical

        };

    }

}