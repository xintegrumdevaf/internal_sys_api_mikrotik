import { WorkflowStep } from "../../../../domain/diagnostic/enums/workflow-step.enum.js";
import { Logger } from "../../../../shared/utils/logger.js";
import type { DiagnosticRequestDTO } from "../../dto/diagnostic.request.dto.js";
import type { SetupUserDeviceUseCase } from "../../../olt/use-cases/setup-user-device.use-case.js";
import type { ISystemHandler } from "../interfaces/isystem.handler copy.js";


export class OnuNotAvailableHandler implements ISystemHandler {

    constructor(
        private readonly setupUserDeviceUseCase: SetupUserDeviceUseCase
    ) { }

    supports(step: WorkflowStep): boolean {
        return step === WorkflowStep.ONU_NOT_AVAILABLE;
    }

    async execute(dto: DiagnosticRequestDTO): Promise<void> {

        const { sector, olt_name, pon, serial } = dto;

        Logger.info(
            `Registrando ONU. Sector=${sector}, OLT=${olt_name}, PON=${pon}, SERIAL=${serial}`
        );

        await this.setupUserDeviceUseCase.execute({
            sector,
            olt_name,
            pon,
            serial
        });

        Logger.success("ONU registrada correctamente.");
    }

}