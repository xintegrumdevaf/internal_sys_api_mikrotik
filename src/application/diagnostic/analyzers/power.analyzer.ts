import { ActionType } from "../../../domain/diagnostic/enums/action.type.js";
import { FindingType } from "../../../domain/diagnostic/enums/finding.type.js";
import { OpticalPowerLevel } from "../../../domain/diagnostic/enums/optical-power-level.enum.js";
import type { DiagnosticContext } from "../../../domain/diagnostic/value-objects/diagnostic.context.js";
import { DiagnosticRules } from "../../../domain/diagnostic/rules/diagnostic.rules.js";
import type { IDiagnosticAnalyzer } from "../interfaces/idiagnostic.analyzer.js";

export class PowerAnalyzer implements IDiagnosticAnalyzer {
    // supports(context: DiagnosticContext): boolean {
    //     return context.technical.power != null
    // }

    supports(context: DiagnosticContext): boolean {
        return true;
    }

    async analyze(context: DiagnosticContext): Promise<void> {
        const power = context.technical.power

        if (power == null) {

            context.report(

                FindingType.POWER_NOT_AVAILABLE,

                ActionType.TRANSFER_SUPPORT

            );

            return;

        }

        const powerLevel = this.getOpticalPowerLevel(power)

        if (powerLevel === OpticalPowerLevel.EXCELLENT) {
            return;
        }

        if (powerLevel === OpticalPowerLevel.WARNING) {

            context.report(

                FindingType.LOW_POWER,

                ActionType.SCHEDULE_VISIT

            );

        }

        if (powerLevel === OpticalPowerLevel.CRITICAL) {

            context.report(

                FindingType.CRITICAL_LOW_POWER,

                ActionType.SCHEDULE_VISIT

            );

        }
    }

    getOpticalPowerLevel(power: number) {
        const { excellent, warning, critical } = DiagnosticRules.opticalPower;

        if (power >= excellent.min && power <= excellent.max) {
            return OpticalPowerLevel.EXCELLENT;
        }

        if (power >= warning.min && power <= warning.max) {
            return OpticalPowerLevel.WARNING;
        }

        if (power >= critical.min && power <= critical.max) {
            return OpticalPowerLevel.CRITICAL;
        }

        return OpticalPowerLevel.UNKNOWN;
    }

}
