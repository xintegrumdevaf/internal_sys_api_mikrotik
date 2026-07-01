// commands/showOnt.steps.ts

import type { Step } from "../../types/step.js";


export function showOntSteps(serial: string): Step[] {

    return [

        {

            wait: /\(config.*\)#\s*$/i,

            command: `show onu info 06`,
            
            expectOutput: true

        }

    ];

}