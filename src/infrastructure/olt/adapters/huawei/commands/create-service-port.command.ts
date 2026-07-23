export const createService = (id: string, vlan: string, pon: string, gem: string) => {
    return `service-port vlan ${vlan} gpon 0/1/${pon} ont ${id} gemport ${gem} multi-service user-vlan ${vlan} tag-transform translate `;
}