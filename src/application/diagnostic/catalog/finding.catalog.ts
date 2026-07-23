
import { DiagnosticStatus } from "../../../domain/diagnostic/enums/diagnostic.status.js";
import { FindingType } from "../../../domain/diagnostic/enums/finding.type.js";
import { Severity } from "../../../domain/diagnostic/enums/severity.js";

export interface FindingSettings {
    severity: Severity;
    stopExecution: boolean;
    status: DiagnosticStatus;
}

export const FindingCatalog: Record<FindingType, FindingSettings> = {

    // ONU

    [FindingType.ONU_NOT_FOUND]: {
        severity: Severity.CRITICAL,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    },

    [FindingType.ONT_NOT_AVAILABLE]: {
        severity: Severity.CRITICAL,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    },

    [FindingType.ONU_OFFLINE]: {
        severity: Severity.HIGH,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    },

    // Optical

    [FindingType.POWER_NOT_AVAILABLE]: {
        severity: Severity.CRITICAL,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    },

    [FindingType.CRITICAL_LOW_POWER]: {
        severity: Severity.CRITICAL,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    },

    [FindingType.LOW_POWER]: {
        severity: Severity.HIGH,
        stopExecution: false,
        status: DiagnosticStatus.WARNING
    },

    [FindingType.HIGH_POWER]: {
        severity: Severity.CRITICAL,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    },

    // Layer 2

    [FindingType.NO_MAC]: {
        severity: Severity.MEDIUM,
        stopExecution: false,
        status: DiagnosticStatus.WARNING
    },

    // Configuration

    [FindingType.CONFIG_ERROR]: {
        severity: Severity.CRITICAL,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    },

    // Unknown

    [FindingType.UNKNOWN]: {
        severity: Severity.CRITICAL,
        stopExecution: true,
        status: DiagnosticStatus.CRITICAL
    }

};