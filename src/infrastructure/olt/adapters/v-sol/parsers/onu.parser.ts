import type { Onu } from "../../../../../domain/olt/entities/onu.entity.js";
import { Logger } from "../../../../../shared/utils/logger.js";



// ajustá esta lista si hay otros modos posibles (ej: "auto")
const KNOWN_MODES = ["sn", "auto"];
const KNOWN_PROFILES = ["default"]; // agregá otros perfiles si existen


export function parseOnuTable(raw: string): Onu[] {


    const lines = raw.split("\n").map(l => l.replace(/\r/g, "").trim());

    const headerIndex = lines.findIndex(l => l.includes("Onuindex"));
    if (headerIndex === -1) return [];

    const dashIndex = lines.findIndex(
        (l, i) => i > headerIndex && /^-+$/.test(l)
    );

    const dataLines = lines
        .slice(dashIndex === -1 ? headerIndex + 1 : dashIndex + 1)
        .filter(l => l.length > 0)
        .filter(l => !/[#>$]\s*$/.test(l)); // corta cuando vuelve el prompt

    Logger.info(`DATA LINES: ${JSON.stringify(dataLines, null, 2)}`, "SSH");

    const profilesPattern = KNOWN_PROFILES.join("|");
    const modesPattern = KNOWN_MODES.join("|");

    // GPON0/6:1  <model><profile><mode><authinfo>  (con o sin espacios reales)
    const rowRegex = new RegExp(
        `^(GPON\\d+\\/\\d+:(\\d+))\\s*(.+?)\\s*(${profilesPattern})\\s*(${modesPattern})\\s*(.+)$`
    );

    const rows: Onu[] = [];

    for (const line of dataLines) {

        const match = line.match(rowRegex);

        if (!match) {
            Logger.warn(`Línea no matcheada: "${line}"`, "SSH");
            continue;
        }

        const onuindex = match[1] ?? "";
        const port = match[2] ?? "";
        const model = match[3] ?? "";
        const profile = match[4] ?? "";
        const mode = match[5] ?? "";
        const authinfo = match[6] ?? "";

        if (!onuindex || !port) continue;

        rows.push({
            onuindex,
            model: model.trim(),
            profile,
            mode,
            authinfo: authinfo.trim(),
            id: Number(port)
        });
    }

    return rows;
}

export function findByAuthInfo(rows: Onu[], authinfo: string): Onu | undefined {
    return rows.find(r => r.authinfo === authinfo);
}