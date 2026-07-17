import type { Olt } from "../../../../../domain/olt/entities/sector.entity.js";
import type { Step } from "../../../../../domain/olt/entities/step.entity.js";


export const loginSteps = (olt: Olt): Step[] => [

    {
        expect: />\s*$/i,

        command: () => `/system telnet ${olt.ip}`,

        success: [
            {
                name: "login",
                regex: /login\s*:/i,
                continue: true
            }
        ]
    },


    {
        expect: /login\s*:/i,

        command: () => olt.username,

        success: [
            {
                name: "password",
                regex: /password\s*:/i,
                continue: true
            }
        ]
    },


    {
        expect: /password\s*:/i,

        command: () => olt.password,

        success: [
            {
                name: "prompt",
                regex: /[>#]\s*$/i,
                continue: true
            }
        ]
    },


    {
        expect: /[>#]\s*$/i,

        command: "enable",

        success: [
            {
                name: "enable-password",
                regex: /password\s*:/i,
                continue: true
            },
            {
                name: "enabled",
                regex: /#\s*$/i,
                continue: true
            }
        ]
    },


    {
        expect: /password\s*:/i,

        command: () => olt.password,

        success: [
            {
                name: "enabled",
                regex: /#\s*$/i,
                continue: true
            }
        ]
    },


    {
        expect: /#\s*$/i,

        command: "configure terminal",

        success: [
            {
                name: "config",
                regex: /\(config.*\)#\s*$/i,
                continue: true
            }
        ]
    }

];