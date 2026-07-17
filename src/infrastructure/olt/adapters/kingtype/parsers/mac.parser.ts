export function parseOnuMac(output: string): string | null {

    const match = output.match(
        /\d+\s+\d+\s+([0-9A-F]{12})/i
    );

    return match ? match[1]!.toUpperCase() : null;
}