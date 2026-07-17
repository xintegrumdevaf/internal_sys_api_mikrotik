export interface OnuTableRow {
    onuId: string;
    id: number;
    serial: string;
    mibReady: boolean;
    status: string;
    streamProfile: number;
    serviceProfile: number;
}

export function parseOnuTable(output: string): OnuTableRow[] {

    return output
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line =>
            line &&
            !line.startsWith("-") &&
            !line.startsWith("onu id") &&
            !line.startsWith("ready") &&
            /^g\d+\/\d+:\d+/.test(line)
        )
        .map(line => {
            const parts = line.split(/\s+/);

            return {
                onuId: parts[0]!,
                id: Number(parts[0]!.split(":")[1]),
                serial: parts[1]!,
                mibReady: parts[2]!?.toLowerCase() === "yes",
                status: parts[3]!,
                streamProfile: Number(parts[4]),
                serviceProfile: Number(parts[5]),
            };
        });
}

export function findOnuBySerial(
    rows: OnuTableRow[],
    serial: string
): OnuTableRow | null {

    return (
        rows.find(
            row => row.serial.toUpperCase() === serial.toUpperCase()
        ) ?? null
    );
}