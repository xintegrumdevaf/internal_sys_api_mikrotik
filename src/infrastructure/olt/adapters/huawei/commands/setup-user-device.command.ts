export const setupUserDevice = (id: string, pon: string, serial: string, lineProfile: string, clientName: string) => {
    return `ont add ${pon} ${id} sn-auth "${serial}" omci ont-lineprofile-id ${lineProfile} ont-srvprofile-id 1 desc "${clientName}"`;
}