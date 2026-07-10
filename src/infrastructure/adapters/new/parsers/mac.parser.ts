export const parseMacTable = (output: string) => {
    return output
        .split('\n')
        .map(line => line.trim())
        .filter(line =>
            /^[0-9A-F]{2}(?::[0-9A-F]{2}){5}/i.test(line)
        )
        .map(line => {
            const [
                mac,
                vlan,
                sport,
                port,
                onu,
                gemid,
                macType
            ] = line.split(/\s+/);

            return {
                mac,
                vlan: Number(vlan),
                sport: Number(sport),
                port,
                onu: Number(onu),
                gemid: Number(gemid),
                macType
            };
        });
}