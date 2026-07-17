import type { Mac } from "../../../../../domain/olt/entities/mac.entity.js";

export function parseMacTable(raw: string): Mac[] {

    const lines = raw
        .split("\n")
        .map(l => l.replace(/\r/g, "").trim())
        .filter(Boolean);

    const rows: Mac[] = [];

    for (const line of lines) {

        // ignora encabezados, notas y prompt
        if (
            line.startsWith("Command:") ||
            line.startsWith("SRV-P") ||
            line.startsWith("INDEX") ||
            line.startsWith("Total:") ||
            line.startsWith("Note:") ||
            line.startsWith("A--") ||
            line.startsWith("VPI") ||
            line.startsWith("VCI") ||
            line.startsWith("v/e") ||
            line.startsWith("ppp") ||
            line.startsWith("F/S/P") ||
            line.startsWith("VLAN") ||
            /^-+$/.test(line) ||
            /#\s*$/.test(line)
        ) {
            continue;
        }

        const match = line.match(
            /^\d+\s+\S+\s+gpon\s+([0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4})\s+(\w+)\s+\d+\s*\/\d+\s*\/\d+\s+(\d+)\s+\d+\s+(\d+)$/i
        );

        if (!match) {
            continue;
        }

        rows.push({
            mac: match[1]!.toLowerCase(),
            type: match[2]!,
            ontId: Number(match[3]!),
            vlan: Number(match[4]!)
        });
    }

    return rows;
}

export function findMacByOntId(
    rows: Mac[],
    ontId: number
): string | null {

    return rows.find(r => r.ontId === ontId)?.mac ?? null;

}