import type { Diagnostic } from "../../../domain/diagnostic/entities/diagnostic.js";

export interface DiagnosticResponseDTO {

    success: boolean;

    diagnostic: Diagnostic;

    workflow: {

        nextAction: string;

        stopExecution: boolean;

    };

    instructions: {

        title: string;

        description: string;

        expectedMedia?: string[];

    };

    technical: {

        profile: string;

        onu: unknown;

        state: unknown;

        power: number | null;

        mac?: unknown;

    };

}