import { ActionType } from "../../../domain/diagnostic/enums/action.type.js";
import { FindingType } from "../../../domain/diagnostic/enums/finding.type.js";
import type { DiagnosticContext } from "../../../domain/diagnostic/value-objects/diagnostic.context.js";
import { Logger } from "../../../shared/utils/logger.js";
import type { IDiagnosticAnalyzer } from "../interfaces/idiagnostic.analyzer.js";

export class MacAnalyzer implements IDiagnosticAnalyzer {

    supports(context: DiagnosticContext): boolean {

        // Solo aplica para OLT Profile New
        // return context.technical.profile === "new";
        return true;

    }

    async analyze(context: DiagnosticContext): Promise<void> {

        const mac = context.technical.mac;

        Logger.info(`MAC IN ANALYZER: ${mac}`)

        if (!mac) {

            context.report(

                FindingType.NO_MAC,

                ActionType.REQUEST_INFORMATION

            );

            return;

        }

        // if (!mac.mac || mac.mac.trim() === "") {

        //     context.warn(

        //         FindingType.NO_MAC,

        //         ActionType.REQUEST_INFORMATION

        //     );

        //     return;

        // }

    }

}