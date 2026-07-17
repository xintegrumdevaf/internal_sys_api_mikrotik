import type { VsolMacInfo } from "../types/vsol-mac-info.type.js";

export function parseMacTable(raw: string): VsolMacInfo[] {

    const rows: VsolMacInfo[] = [];

    const lines = raw
        .split("\n")
        .map(l => l.replace(/\r/g, "").trim())
        .filter(Boolean);

    const regex =
        /^([0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4})(\d+)(Dynamic|Static)(GPON\d+\/\d+:(\d+))\s+(\d+)$/i;

    for (const line of lines) {

        const match = line.match(regex);

        if (!match) {
            continue;
        }

        rows.push({

            mac: match[1]!.toLowerCase(),

            vlan: Number(match[2]),

            type: match[3]!,

            onuId: Number(match[5])

        });

    }

    return rows;

}

export function findMacByOnuId(
    rows: VsolMacInfo[],
    onuId: number
): string | null {

    return rows.find(r => r.onuId === onuId)?.mac ?? null;

}