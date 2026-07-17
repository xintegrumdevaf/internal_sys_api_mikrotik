export interface HuaweiOntInfo {
    frame: number;
    slot: number;
    pon: number;
    id: number;

    controlFlag: string;
    runState: string;
    configState: string;
    matchState: string;

    serial: string;
    vendorSerial: string;

    managementMode: string;
    softwareMode: string;
    isolationState: string;

    ip: string | null;
    description: string | null;
}