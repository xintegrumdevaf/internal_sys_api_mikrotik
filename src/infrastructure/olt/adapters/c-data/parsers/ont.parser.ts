// utils/parsers/huawei/parseHuaweiOntInfo.ts

export interface HuaweiOntInfo {
    frame: number;
    slot: number;
    pon: number;
    id: number;
    serial: string;
    controlFlag: string;
    runState: string;
    configState: string;
    matchState: string;
}

export function parseOntInfo(raw: string): HuaweiOntInfo | null {

    const lines = raw
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

    // Buscar la línea que empieza con F/S P ONT...
    const dataLine = lines.find(line =>
        /^\d+\/\d+\s+\d+\s+\d+\s+/.test(line)
    );

    if (!dataLine) {
        return null;
    }

    /**
     * Ejemplo:
     *
     * 0/0 9 99 MONU00444444 Active Online success match
     */

    const match = dataLine.match(
        /^(\d+)\/(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/i
    );

    if (!match) {
        return null;
    }

    const [
        ,
        frame,
        slot,
        pon,
        id,
        serial,
        controlFlag,
        runState,
        configState,
        matchState
    ] = match;

    if (
        !frame ||
        !slot ||
        !pon ||
        !id ||
        !serial ||
        !controlFlag ||
        !runState ||
        !configState ||
        !matchState
    ) {
        return null;
    }

    return {
        frame: Number(frame),
        slot: Number(slot),
        pon: Number(pon),
        id: Number(id),
        serial,
        controlFlag,
        runState,
        configState,
        matchState
    };
}

interface OntAutofindInfo {
    number: number;
    frameSlot: string;
    port: number;
    logicId: number;
    ontSN: string;
    password: string;
    loid: string;
    loidPassword: string;
    omccVer: string;
    vendorId: string;
    ontVersion: string;
    ontSoftwareVersion: string;
    equipmentId: string;
    lastAutofindTime: string;
}

export function parseAutofindOnts(text: string): OntAutofindInfo[] {
    // Divide el texto en bloques, uno por cada ONT
    const blocks = text
        .split(/-+\s*/g)
        .map((block) => block.trim())
        .filter((block) => block.includes("Number"));

    return blocks.map((block) => {
        const getValue = (label: string): string => {
            const regex = new RegExp(`${label}\\s*:\\s*(.*)`);
            const match = block.match(regex);
            return match ? match[1]!.trim() : "";
        };

        return {
            number: Number(getValue("Number")),
            frameSlot: getValue("Frame/Slot"),
            port: Number(getValue("Port")),
            logicId: Number(getValue("Logic ID")),
            ontSN: getValue("Ont SN"),
            password: getValue("Password"),
            loid: getValue("Loid"),
            loidPassword: getValue("Loid Password"),
            omccVer: getValue("OMCC Ver"),
            vendorId: getValue("Vendor ID"),
            ontVersion: getValue("Ont Version"),
            ontSoftwareVersion: getValue("Ont Software Version"),
            equipmentId: getValue("Equipment ID"),
            lastAutofindTime: getValue("Last autofind time"),
        };
    });
}

export function findOntBySN(
    onts: OntAutofindInfo[],
    ontSN: string
): OntAutofindInfo | undefined {
    return onts.find((ont) => {
        const serial = ont.ontSN.split(" ")[0];
        return serial?.toUpperCase() === ontSN?.toUpperCase();
    });
}
