import type { OnuRxPower } from "../../../../shared/types/onu.js";

export function parseOnuRxPower(raw: string): OnuRxPower | null {

    const regex =
        /(GPON\d+\/\d+:\d+).*?(-?\d+(?:\.\d+)?)\((dbm)\)/is;

    const match = raw.match(regex);

    if (!match) return null;

    const [
        ,
        onuIndex,
        rxPower,
        unit
    ] = match;

    return {
        onuIndex: onuIndex!,
        rxPower: Number(rxPower!),
        unit: unit!
    };
}