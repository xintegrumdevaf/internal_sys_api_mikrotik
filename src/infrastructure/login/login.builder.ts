import type { Olt } from "../../shared/types/sector.js";
import type { Step } from "../../shared/types/step.js";

export type LoginProfile = "legacy" | "new";

export function buildLoginSteps(
    profile: LoginProfile,
    olt: Olt
): Step[] {

    if (profile === "legacy") {

        return [

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
                wait: /#\s*$/i,
                command: "configure terminal"
            }

        ];

    }

    return [

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

    ];

}