export function parseOnuRxPower(output: string): number | null {

    const match = output.match(
        /rx power\s*:\s*(-?\d+(\.\d+)?)\s*\(dbm\)/i
    );

    return match ? Number(match[1]) : null;
}