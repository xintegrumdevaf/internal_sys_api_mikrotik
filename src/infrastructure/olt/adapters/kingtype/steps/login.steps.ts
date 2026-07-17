import type { Olt } from "../../../../../domain/olt/entities/sector.entity.js"
import type { Step } from "../../../../../domain/olt/entities/step.entity.js"


export const loginSteps = (olt: Olt): Step[] => [

    // ==========================
    // TELNET HACIA OLT
    // ==========================
    {
        expect: />\s*$/i,

        command: () => `/system telnet ${olt.ip}`,

        success: [
            {
                name: "telnet_connected",
                regex: /Press any key to login/i,
                continue: true
            }
        ]
    },


    // ==========================
    // CONFIRMAR LOGIN
    // ==========================
    {
        expect: /Press any key to login/i,

        command: "\n",

        success: [
            {
                name: "username",
                regex: /Username:/i,
                continue: true
            }
        ]
    },


    // ==========================
    // USUARIO
    // ==========================
    {
        expect: /Username:/i,

        command: olt.username,

        success: [
            {
                name: "password",
                regex: /Password:/i,
                continue: true
            }
        ]
    },


    // ==========================
    // PASSWORD
    // ==========================
    {
        expect: /Password:/i,

        command: olt.password,

        success: [
            {
                name: "cli",
                regex: /[>#]\s*$/i,
                continue: true
            }
        ]
    },


    // ==========================
    // ENABLE
    // ==========================
    {
        expect: /[>#]\s*$/i,

        command: "en",

        success: [
            {
                name: "enable_mode",
                regex: /SOLES\(pri\)>\s*$/i,
                continue: true
            },

            {
                name: "enable_hash",
                regex: /#\s*$/i,
                continue: true
            }
        ]
    },


    // ==========================
    // CONFIG TERMINAL
    // ==========================
    {
        expect: /SOLES\(pri\)>\s*$/i,

        command: "configure terminal",

        success: [
            {
                name: "config_mode",
                regex: /\(config.*\)[#>]\s*$/i,
                continue: true
            }
        ]
    }

]