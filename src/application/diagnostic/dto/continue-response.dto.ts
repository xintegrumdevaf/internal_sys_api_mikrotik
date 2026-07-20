export interface ContinueDiagnosticResponseDTO {

    success: boolean;

    status: string;

    currentStep: string | null;

    stopExecution: boolean;

    instruction: string;

    finished: boolean;

}