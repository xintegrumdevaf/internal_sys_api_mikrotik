// export const showOnuInfo = (pon: string) => {
//     return `show onu info ${pon}`;
// }

export const setupUserDevice = (pon: string, id: string, serial: string) => {
    return `ont  add  ${pon} ${id} sn-auth ${serial}  ont-lineprofile-id ${pon} ont-srvprofile-id 0`;
}