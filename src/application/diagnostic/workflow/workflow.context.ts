import type { DiagnosticSession } from "../../../domain/diagnostic/entities/diagnostic-session.js";
import { WorkflowStatus } from "../../../domain/diagnostic/enums/workflow-status.enum.js";
import { WorkflowStep } from "../../../domain/diagnostic/enums/workflow-step.enum.js";



export class WorkflowContext {


    constructor(

        public readonly session: DiagnosticSession,

        public readonly message: string

    ) { }


    instruction: string | null = null;


    finished = false;



    update(

        status: WorkflowStatus,

        step: WorkflowStep

    ) {

        this.session.status = status;

        this.session.currentStep = step;

    }



    waitUser(

        step: WorkflowStep,

        message: string

    ) {


        this.update(

            WorkflowStatus.WAITING_USER,

            step

        );


        this.instruction = message;

    }



    waitSystem(

        step: WorkflowStep,

        message: string

    ) {


        this.update(

            WorkflowStatus.WAITING_SYSTEM,

            step

        );


        this.instruction = message;

    }




    complete(

        message: string

    ) {


        this.update(

            WorkflowStatus.COMPLETED,

            WorkflowStep.NONE

        );


        this.instruction = message;


        this.finished = true;

    }




    fail(

        message: string

    ) {

        this.update(

            WorkflowStatus.FAILED,

            WorkflowStep.NONE

        );


        this.instruction = message;


        this.finished = true;

    }


}