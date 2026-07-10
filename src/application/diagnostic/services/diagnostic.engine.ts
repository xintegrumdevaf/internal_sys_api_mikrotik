import { DiagnosticStatus } from "../../../domain/diagnostic/enums/diagnostic.status.js";
import { DiagnosticContext } from "../../../domain/diagnostic/value-objects/diagnostic.context.js";
import type { TechnicalDataResponseDTO } from "../../olt/dto/technical-data.response.dto.js";
import type { IDiagnosticAnalyzer } from "../interfaces/idiagnostic.analyzer.js";

export class DiagnosticEngine {
    constructor(private readonly analyzers: IDiagnosticAnalyzer[]) { }


    async execute(technicalData: TechnicalDataResponseDTO) {

        const context = new DiagnosticContext(technicalData)

        for (const analyzer of this.analyzers) {
            if (!analyzer.supports(context)) {
                continue;
            }

            await analyzer.analyze(context)

        }

        return context
        // const context: DiagnosticContext = {
        //     technical: technicalData,
        //     findings: [],
        //     actions: [],
        //     warnings: [],
        //     result: DiagnosticStatus.FAILED
        // }

        // for (const analyzer of this.analyzers) {
        //     await analyzer.analyze(context)
        // }

        // return context;
    }
}