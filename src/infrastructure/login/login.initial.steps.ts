import type { Olt } from "../../shared/types/sector.js";
import type { Step } from "../../shared/types/step.js";


export const initialLoginSteps = (olt: Olt): Step[] => [
    {
        wait: />\s*$/i,
        command: `/system telnet ${olt.ip}`
    },
];