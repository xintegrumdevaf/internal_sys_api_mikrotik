import { FindingType } from "../../../domain/diagnostic/enums/finding.type.js";
import { Severity } from "../../../domain/diagnostic/enums/severity.js";

export const FindingCatalog: Record<FindingType, Record<string, any>> = {
    [FindingType.ONU_OFFLINE]: {
        severity: Severity.HIGH,

        stopExecution: true
    },

    [FindingType.LOW_POWER]: {
        severity: Severity.HIGH,

        stopExecution: false
    },

    [FindingType.NO_MAC]: {
        severity: Severity.MEDIUM,

        stopExecution: false
    },

    [FindingType.ONU_NOT_FOUND]: {
        severity: Severity.CRITICAL,

        stopExecution: true
    },
    [FindingType.ONU_ONLINE]: {
        severity: Severity.LOW,
        stopExecution: false
    },
    [FindingType.HIGH_POWER]: {
        severity: Severity.CRITICAL,

        stopExecution: true
    },
    [FindingType.CONFIG_ERROR]: {
        severity: Severity.CRITICAL,

        stopExecution: true
    },
    [FindingType.POWER_NOT_AVAILABLE]: {
        severity: Severity.CRITICAL,

        stopExecution: true
    },
    [FindingType.CRITICAL_LOW_POWER]: {
        severity: Severity.CRITICAL,

        stopExecution: true
    },
    [FindingType.UNKNOWN]: {
        severity: Severity.CRITICAL,

        stopExecution: true
    }
};