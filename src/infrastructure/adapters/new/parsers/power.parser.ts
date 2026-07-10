export const parseOntRxPower = (output: string) => {

    const match = output.match(/Rx\s+optical\s+power\(dBm\)\s*:\s*(-?\d+(?:\.\d+)?)/i);

    const rxPower = match ? Number(match[1]) : null;

    return rxPower
}

