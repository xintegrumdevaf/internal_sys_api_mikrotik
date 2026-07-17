export function parseRxOpticalPower(raw: string): number | null {

    const match = raw.match(
        /Rx optical power\(dBm\)\s*:\s*(-?\d+(?:\.\d+)?)/i
    );

    return match ? Number(match[1]) : null;
}