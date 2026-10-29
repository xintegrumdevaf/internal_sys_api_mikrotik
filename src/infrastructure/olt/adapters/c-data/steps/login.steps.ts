import type { Olt } from "../../../../../domain/olt/entities/sector.entity.js";
import type { Step } from "../../../../../domain/olt/entities/step.entity.js";

export const loginSteps = (olt: Olt): Step[] => [
    // ==========================
    // ENTRAR POR TELNET
    // ==========================
    {
        expect: />\s*$/i,
        command: () => `/system telnet ${olt.ip}`,
        success: [
            {
                name: "telnet_login",
                regex: /User name:|Username:|login:/i,
                continue: true
            },
            {
                name: "connection_reset",
                regex: /Connection reset by peer|read\(\) failed/i,
                continue: false
            },
            {
                name: "connection_refused",
                regex: /Connection refused|could not connect/i,
                continue: false
            }
        ]
    },

    // ==========================
    // USUARIO
    // ==========================
    {
        expect: /User name:|Username:|login:/i,
        command: olt.username,
        success: [
            {
                name: "password",
                regex: /User password:|Password:/i,
                continue: true
            }
        ]
    },

    // ==========================
    // PASSWORD -> PROMPT DE TERMINAL (# o >)
    // ==========================
    {
        expect: /User password:|Password:/i,
        command: olt.password,
        success: [
            {
                name: "cli",
                regex: /[>#]\s*$/i,
                continue: true
            },
            {
                name: "invalid_credentials",
                regex: /Login incorrect|invalid|fail/i,
                continue: false
            }
        ]
    }
];
