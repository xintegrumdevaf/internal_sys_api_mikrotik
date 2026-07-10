// utils/parsers/huawei/parseHuaweiOntInfo.ts

import type { HuaweiOntInfo } from "../../../../shared/types/ont.js";


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