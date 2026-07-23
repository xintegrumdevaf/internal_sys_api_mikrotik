import { ActionType } from "../../../domain/diagnostic/enums/action.type.js";

export const ActionPriorityCatalog: Record<ActionType, number> = {
    [ActionType.ASK_LED_STATUS]: 1,
    [ActionType.REQUEST_INFORMATION]: 1,
    [ActionType.REBOOT_ONU]: 2,
    [ActionType.VERIFY_POWER]: 2,
    [ActionType.HOOK_USER_DEVICE]: 1,
    [ActionType.SCHEDULE_VISIT]: 10,
    [ActionType.TRANSFER_SUPPORT]: 100
    // [ActionType.REQUEST_MEDIA]: {
    //     priority: 1,
    //     stopExecution: true
    // },
    // [ActionType.REQUEST_INFORMATION]: {
    //     priority: 1,
    //     stopExecution: true
    // },
    // [ActionType.REBOOT_ONU]: {
    //     priority: 2,
    //     stopExecution: true
    // },
    // [ActionType.VERIFY_POWER]: {
    //     priority: 2,
    //     stopExecution: false
    // },
    // [ActionType.SCHEDULE_VISIT]: {
    //     priority: 10,
    //     stopExecution: true
    // },
    // [ActionType.TRANSFER_SUPPORT]: {
    //     priority: 100,
    //     stopExecution: true
    // }
    ,

























    [ActionType.CONTINUE]: 0,
    [ActionType.RECHECK]: 0,
    [ActionType.FINISH]: 0,
}