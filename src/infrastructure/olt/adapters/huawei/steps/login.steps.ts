import type { Olt } from "../../../../../domain/olt/entities/sector.entity.js";
import type { Step } from "../../../../../domain/olt/entities/step.entity.js";

export const loginSteps = (olt: Olt): Step[] => [
    {
        expect: />\s*$/i,
        command: `/system telnet ${olt.ip}`,
        success: [
            {
                name: "username",
                regex: /User name:/i,
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
            },
            {
                name: "user_locked",
                regex: /locked and you cannot log on/i,
                continue: false
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
            },
            {
                name: "user_locked",
                regex: /locked and you cannot log on/i,
                continue: false
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
                name: "password_expired",
                regex: /password has expired/i,
                continue: false
            },
            {
                name: "user_locked",
                regex: /locked and you cannot log on/i,
                continue: false
            },
            {
                name: "invalid_credentials",
                regex: /Username or password invalid|Reenter times have reached the upper limit|>>User name:/i,
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
