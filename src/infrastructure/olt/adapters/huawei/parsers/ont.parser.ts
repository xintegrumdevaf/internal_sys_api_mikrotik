import type { HuaweiOntInfo } from "../types/huawei-ont-info.type.js";

export function parseOntInfo(output: string): HuaweiOntInfo {

    const get = (field: string): string | null => {

        const regex = new RegExp(
            `${field}\\s*:\\s*(.+)`,
            "i"
        );

        const match = output.match(regex);

        return match?.[1]?.trim() ?? null;

    };

    const fsp = get("F/S/P") ?? "";

    const [, frame = "0", slot = "0", pon = "0"] =
        fsp.match(/(\d+)\/(\d+)\/(\d+)/) ?? [];

    const sn = get("SN") ?? "";

    const serialMatch =
        sn.match(/^([A-F0-9]+)\s+\((.*?)\)$/i);

    return {

        frame: Number(frame),
        slot: Number(slot),
        pon: Number(pon),

        id: Number(get("ONT-ID") ?? 0),

        controlFlag: get("Control flag") ?? "",

        runState: get("Run state") ?? "",

        configState: get("Config state") ?? "",

        matchState: get("Match state") ?? "",

        serial: serialMatch?.[1] ?? "",

        vendorSerial: serialMatch?.[2] ?? "",

        managementMode: get("Management mode") ?? "",

        softwareMode: get("Software work mode") ?? "",

        isolationState: get("Isolation state") ?? "",

        ip: get("ONT IP 0 address/mask"),

        description: get("Description")

    };

}