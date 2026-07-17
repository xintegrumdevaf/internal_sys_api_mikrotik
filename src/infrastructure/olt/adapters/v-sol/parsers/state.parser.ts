import type { OnuState } from "../../../../../domain/olt/entities/onu-state.entity.js";
import { Logger } from "../../../../../shared/utils/logger.js";

export function parseOnuState(raw: string): OnuState | undefined {

    const lines = raw
        .split("\n")
        .map(l => l.replace(/\r/g, "").trim())
        .filter(Boolean);


    const dataLine = lines.find(l =>
        /^\d+\/\d+\/\d+:\d+/.test(l)
    );


    if (!dataLine) {
        Logger.warn(
            `No se encontró línea de estado ONU: ${raw}`,
            "SSH"
        );

        return;
    }


    const match = dataLine.match(
        /^(.+?:\d+)(enable|disable)(enable|disable)(online|offline|working|los|initial|dyinggasp|offLine)(.+)$/i
    );


    if (!match) {

        Logger.warn(
            `No hizo match state VSOL: ${dataLine}`,
            "SSH"
        );

        return;
    }


    const onuNumberLine = lines.find(l =>
        l.startsWith("ONU Number")
    );


    return {

        onuIndex: match[1]?.trim() ?? "",

        adminState: match[2]?.toLowerCase() ?? "",

        omccState: match[3]?.toLowerCase() ?? "",

        phaseState: match[4]?.toLowerCase() ?? "",

        channel: match[5]?.trim() ?? "",

        onuNumber:
            onuNumberLine
                ?.split(":")[1]
                ?.trim() ?? ""

    };
}