import type { Olt } from "../../../../../domain/olt/entities/sector.entity.js"
import type { Step } from "../../../../../domain/olt/entities/step.entity.js"

export const loginSteps = (olt: Olt): Step[] => [
    {
        wait: />\s*$/i,
        command: `/system telnet ${olt.ip}`
    },
    {
        wait: /User name:/i,
        command: olt.username
    },

    {
        wait: /User password:/i,
        command: olt.password
    },

    {
        wait: /[>#]\s*$/i,
        command: "enable"
    },

    {
        wait: /User password:/i,
        command: olt.password
    },

    {
        wait: /#\s*$/i,
        command: "config"
    }
]