import type { CollectTechnicalDataUseCase } from "../../olt/use-cases/collect-technical-data.use-case.js";
import type { DiagnosticRequestDTO } from "../dto/diagnostic.request.dto.js";

export class ExecuteDiagnosticUseCase {
    constructor(
        private readonly collectTechnicalData:
            CollectTechnicalDataUseCase, private readonly diagnosticEngine: any
    ) { }

    async execute(dto: DiagnosticRequestDTO) {
        const technicalData = await this.collectTechnicalData.execute(dto)

        return this.diagnosticEngine.execute(technicalData)
    }
}