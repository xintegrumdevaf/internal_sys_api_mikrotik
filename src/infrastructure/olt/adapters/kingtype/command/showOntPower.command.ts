
export const showOntPower = (pon: string | number, id: number): string => {
    return `show gpon-onu optical-info g2/${pon}:${id}`;
}