import type { Olt } from "../../../../../domain/olt/entities/sector.entity.js";
import type { Step } from "../../../../../domain/olt/entities/step.entity.js";

export const loginSteps = (olt: Olt): Step[] => [
    {
        expect: />\s*$/i,
        command: () => `/system telnet ${olt.ip}`,
        success: [
            {
                name: "login",
                regex: /login\s*:|Username\s*:|User name\s*:/i,
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
    {
        expect: /login\s*:|Username\s*:|User name\s*:/i,
        command: () => olt.username,
        success: [
            {
                name: "password",
                regex: /password\s*:|User password\s*:/i,
                continue: true
            }
        ]
    },
    {
        expect: /password\s*:|User password\s*:/i,
        command: () => olt.password,
        success: [
            {
                name: "prompt",
                regex: /[>#]\s*$/i,
                continue: true
            },
            {
                name: "invalid_credentials",
                regex: /Login incorrect|invalid|fail/i,
                continue: false
            }
        ]
    },
    {
        expect: /[>#]\s*$/i,
        command: "enable",
        success: [
            {
                name: "enable-password",
                regex: /password\s*:|User password\s*:/i,
                continue: true
            },
            {
                name: "enabled",
                regex: /#\s*$/i,
                continue: true
            },
            {
                name: "already_enabled",
                regex: /Bad command[\s\S]*#\s*$|Unknown command[\s\S]*#\s*$/i,
                continue: true
            }
        ]
    },
    {
        expect: /password\s*:|User password\s*:/i,
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
            },
            {
                name: "already_config_or_epon",
                regex: /Bad command[\s\S]*#\s*$|Unknown command[\s\S]*#\s*$/i,
                continue: true
            }
        ]
    }
];
