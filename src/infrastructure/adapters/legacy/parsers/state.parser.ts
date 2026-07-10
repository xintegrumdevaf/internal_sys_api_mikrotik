import type { OnuState } from "../../../../shared/types/onu.js";

export function parseOnuState(raw: string): OnuState | undefined {

    const lines = raw
        .split("\n")
        .map(l => l.replace(/\r/g, "").trim())
        .filter(Boolean);

    const dataLine = lines.find(l => l.startsWith("1/"));

    if (!dataLine) return;

    const match = dataLine.match(
        /^(.*?)\s*(enable|disable)(enable|disable)(working|offline|los|initial|dyinggasp)(.+)$/
    );

    if (!match) return;

    const onuNumberLine = lines.find(l => l.startsWith("ONU Number"));



    return {

        onuIndex: match[1] || "",

        adminState: match[2] || "",

        omccState: match[3] || "",

        phaseState: match[4] || "",

        channel: match[5]?.trim() || "",

        onuNumber: onuNumberLine?.split(":")[1]?.trim() || ""

    };

}