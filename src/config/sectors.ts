import type { SectorConfig } from "../domain/olt/entities/sector.entity.js"
import { Brand } from "../domain/olt/enums/brand.enum.js"


export const MIKROTIK_CREDENTIALS = {
    port: 8322,
    username: "ANGEL",
    password: "D1q6G7u0C7"
}

export const SECTORS: SectorConfig = {
    pomasqui: {
        host: "45.70.201.81",
        olts: {
            bicentenario: {
                ip: "172.40.0.132",
                username: "admin",
                password: "Xpon@Olt9417#",
                brand: Brand.VSOL
            },
            pomasqui: {
                ip: "172.40.0.130",
                username: "admin",
                password: "admin",
                brand: Brand.SM
            }
        }
    },
    sanAntonio: {
        host: "177.234.217.27",
        olts: {
            kyngtype: {
                ip: "172.40.0.146",
                username: "admin",
                password: "admin",
                brand: Brand.KINGTYPE
            },
            rumicucho: {
                ip: "172.40.0.147",
                username: "root",
                password: "admin",
                brand: Brand.CDATA
            },
            cDataSoles: {
                ip: "172.40.0.148",
                username: "root",
                password: "admin",
                brand: Brand.CDATA
            },
        }
    },
    pifo: {
        host: "177.234.212.178",
        olts: {
            pifo: {
                ip: "172.40.25.2",
                username: "admin",
                password: "admin1",
                brand: Brand.VSOL
            }
        }
    },
    calacali: {
        host: "177.234.217.26",
        olts: {
            calacali: {
                ip: "172.40.0.2",
                username: "admin",
                password: "Xpon@Olt9417#",
                brand: Brand.VSOL
            }
        }
    },
    cuenca: {
        host: "181.78.197.184",
        olts: {
            bellavista: {
                ip: "172.40.0.4",
                username: "sistema",
                password: "sistema123#",
                brand: Brand.HUAWEI
            },
            totoracocha: {
                ip: "172.40.0.3",
                username: "@dmin123",
                password: "@dmin123",
                brand: Brand.HUAWEI
            }
        }
    },
    quitoSur: {
        host: "200.24.136.33",
        olts: {
            santaBarbara: {
                ip: "172.40.5.4",
                username: "sistema",
                password: "oltsantab123",
                brand: Brand.HUAWEI
            },
        }
    }
}