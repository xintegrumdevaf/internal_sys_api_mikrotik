import { ActionType } from "../enums/action.type.js";
import { WorkflowStatus } from "../enums/workflow-status.enum.js";
import { WorkflowStep } from "../enums/workflow-step.enum.js";

export const WorkflowCatalog = {

    [ActionType.HOOK_USER_DEVICE]: {

        status: WorkflowStatus.WAITING_SYSTEM,

        step: WorkflowStep.ONU_NOT_AVAILABLE,

        stop: true

    },

    [ActionType.ASK_LED_STATUS]: {

        status: WorkflowStatus.WAITING_USER,

        step: WorkflowStep.ASK_LED_STATUS,

        stop: true

    },

    [ActionType.REQUEST_INFORMATION]: {

        status: WorkflowStatus.WAITING_USER,

        step: WorkflowStep.REQUEST_INFORMATION,

        stop: true

    },

    [ActionType.VERIFY_POWER]: {

        status: WorkflowStatus.WAITING_USER,

        step: WorkflowStep.VERIFY_POWER,

        stop: true

    },

    [ActionType.REBOOT_ONU]: {

        status: WorkflowStatus.WAITING_SYSTEM,

        step: WorkflowStep.REBOOT_ONU,

        stop: true

    },

    [ActionType.RECHECK]: {

        status: WorkflowStatus.WAITING_SYSTEM,

        step: WorkflowStep.RECHECK,

        stop: true

    },

    [ActionType.SCHEDULE_VISIT]: {

        status: WorkflowStatus.COMPLETED,

        step: WorkflowStep.SCHEDULE_VISIT,

        stop: true

    },

    [ActionType.TRANSFER_SUPPORT]: {

        status: WorkflowStatus.COMPLETED,

        step: WorkflowStep.TRANSFER_SUPPORT,

        stop: true

    },

    [ActionType.FINISH]: {

        status: WorkflowStatus.COMPLETED,

        step: WorkflowStep.NONE,

        stop: true

    },

    [ActionType.CONTINUE]: {

        status: WorkflowStatus.IN_PROGRESS,

        step: WorkflowStep.NONE,

        stop: false

    }

};