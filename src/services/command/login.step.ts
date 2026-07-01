import type { Olt } from "../../types/sector.js";
import type { Step } from "../../types/step.js";

export const loginSteps = (olt: Olt): Step[] => {
    return [

        {
            wait: />\s*/i,
            command: `/system telnet ${olt.ip}`
        },

        {
            wait: /login:/i,
            command: olt.username
        },

        {
            wait: /password:/i,
            command: olt.password
        },

        {
            wait: /[>#]\s*$/i,
            command: "enable"
        },

        {
            wait: /password:/i,
            command: olt.password
        },

        {
            wait: /#\s*/i,
            command: "configure terminal"
        }

    ];
}