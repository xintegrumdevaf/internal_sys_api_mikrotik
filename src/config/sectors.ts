import type { SectorConfig } from "../types/sector.js"

export const MIKROTIK_CREDENTIALS = {
    port: 8322,
    username: "ANGEL",
    password: "D1q6G7u0C7"
}

export const SECTORS: SectorConfig = {
    pomasqui: {
        host: "45.70.201.81",
        olts: {
            main: {
                ip: "172.40.0.132",
                username: "admin",
                password: "Xpon@Olt9417#"
            }
        }
    },
    sanAntonio: {
        host: "177.234.217.27",
        olts: {
            kyngtype: {
                ip: "172.40.0.146",
                username: "admin",
                password: "admin"
            },
            cDataSoles: {
                ip: "172.40.0.148",
                username: "root",
                password: "admin"
            },
            rumicucho: {
                ip: "172.40.0.147",
                username: "root",
                password: "admin"
            },
        }
    },
    pifo: {
        host: "177.234.212.178",
        olts: {
            main: {
                ip: "172.40.0.132",
                username: "admin",
                password: "Xpon@Olt9417#"
            }
        }
    },
    calacali: {
        host: "177.234.217.26",
        olts: {
            main: {
                ip: "172.40.0.132",
                username: "admin",
                password: "Xpon@Olt9417#"
            }
        }
    }
}


// mikrotik: {
//     host: "45.70.201.81",
//     port: 8322,
//     username: "ANGEL",
//     password: "D1q6G7u0C7"
// },
// olt: {
//     ip: "172.40.0.132",
//     username: "admin",
//     password: "Xpon@Olt9417#"
// }