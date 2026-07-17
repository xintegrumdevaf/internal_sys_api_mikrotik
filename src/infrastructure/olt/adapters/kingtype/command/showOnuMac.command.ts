
export const showOnuMac = (pon: string, id: number) => {
    return `show gpon-onu  mac-address-table g2/${pon}:${id}`;
}