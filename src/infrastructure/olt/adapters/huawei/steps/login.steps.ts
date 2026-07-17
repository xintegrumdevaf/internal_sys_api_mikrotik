import type { Olt } from "../../../../../domain/olt/entities/sector.entity.js"
import type { Step } from "../../../../../domain/olt/entities/step.entity.js"


export const loginSteps = (olt: Olt): Step[] => [
    {
        expect: />\s*$/i,
        command: `/system telnet ${olt.ip}`,
        success: [
            {
                name: "username",
                regex: /User name:/i,
                continue: true
            }
        ]
    },
    {
        expect: /User name:/i,
        command: olt.username,
        success: [
            {
                name: "password",
                regex: /User password:/i,
                continue: true
            }
        ]
    },
    {
        expect: /User password:/i,
        command: olt.password,
        success: [
            {
                name: "connected",
                regex: /MA5800.*>/i,
                continue: true
            },
            {
                name: "invalid_credentials",
                regex: /Username or password invalid/i,
                continue: false
            }
        ]
    },
    {
        expect: /MA5800.*>\s*$/i,
        command: "enable",
        success: [
            {
                name: "enable",
                regex: /MA5800.*\s*$/i,
                continue: true
            },
            {
                name: "error_enabled",
                regex: /Unknown command/i,
                continue: false
            }
        ]
    },
    {
        expect: /MA5800.*#\s*$/i,
        command: "config",
        success: [
            {
                name: "config",
                regex: /MA5800.*\(config\)#\s*$/i,
                continue: true
            },
            {
                name: "error_config",
                regex: /Unknown command/i,
                continue: false
            }
        ]
    }
];
