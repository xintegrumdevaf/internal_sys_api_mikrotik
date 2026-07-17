import type { Onu } from "../../../../../domain/olt/entities/onu.entity.js";
import { Logger } from "../../../../../shared/utils/logger.js";

export function parseOnuTable(raw: string): Onu[] {

    const lines = raw
        .split("\n")
        .map(l => l.replace(/\r/g, "").trim())
        .filter(Boolean);


    const dataLines = lines.filter(line =>
        /^GPON\d+\/\d+:\d+/i.test(line)
    );


    Logger.info(
        `DATA LINES: ${JSON.stringify(dataLines, null, 2)}`,
        "SSH"
    );


    const rows: Onu[] = [];


    const rowRegex =
        /^(GPON\d+\/\d+):(\d+)([A-Za-z0-9-]+?)(default)(sn)([A-Z0-9]+)$/i;


    for (const line of dataLines) {


        const match = line.match(rowRegex);


        if (!match) {

            Logger.warn(
                `Línea no matcheada: "${line}"`,
                "SSH"
            );

            continue;
        }


        const pon = match[1];
        const id = match[2];
        const model = match[3];
        const profile = match[4];
        const mode = match[5];
        const authinfo = match[6];

        if (
            !id ||
            !model ||
            !profile ||
            !mode ||
            !authinfo
        ) {
            Logger.warn(
                `ONU incompleta: ${line}`,
                "SSH"
            );

            continue;
        }


        rows.push({

            onuindex: `${pon}:${id}`,

            id: Number(id),

            model,

            profile,

            mode,

            authinfo

        });


        rows.push({

            onuindex: `${pon}:${id}`,

            id: Number(id),

            model,

            profile,

            mode,

            authinfo

        });

    }


    return rows;
}
export function findByAuthInfo(rows: Onu[], authinfo: string): Onu | undefined {
    return rows.find(r => r.authinfo === authinfo);
}