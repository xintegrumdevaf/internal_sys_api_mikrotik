import { FindingType } from "../enums/finding.type.js";

export const DiagnosticInstructions: Partial<Record<FindingType, string>> = {

    [FindingType.ONU_NOT_FOUND]: "No fue posible localizar la ONU registrada en la OLT. Verifica el número de serie, la configuración del servicio o la provisión del equipo.",

    [FindingType.ONU_OFFLINE]: "Para continuar con la revisión, verifique su equipo de Internet. Si no tiene luces encendidas, confirme que esté conectado a la corriente y enciéndalo si es necesario. Espere unos minutos y revise si el servicio se restablece. Si tiene luces encendidas, indíquenos sus colores (por ejemplo, todas verdes o alguna roja) y, si la luz roja tiene un nombre o símbolo, indíquenos cuál es.",

    [FindingType.POWER_NOT_AVAILABLE]: "La OLT no pudo obtener la potencia óptica de la ONU. Esto normalmente ocurre cuando el equipo está fuera de línea o no responde.",

    [FindingType.CRITICAL_LOW_POWER]: "La potencia óptica recibida está muy por debajo del rango permitido. Es probable que exista una falla en la fibra, conectores o splitter. Se recomienda una visita técnica.",

    [FindingType.LOW_POWER]: "La potencia óptica recibida se encuentra por debajo del rango recomendado. Se recomienda revisar el estado de la acometida y la calidad de la señal.",

    [FindingType.HIGH_POWER]: "La potencia óptica recibida supera el rango permitido. Verifica la atenuación de la red óptica y la correcta instalación del enlace.",

    [FindingType.NO_MAC]: "La OLT no está aprendiendo ninguna dirección MAC desde la ONU. Verifica el router del cliente, el cable Ethernet y el puerto LAN de la ONU.",

    [FindingType.CONFIG_ERROR]: "Se detectó una inconsistencia en la configuración de la ONU o de la OLT. Es necesario revisar la provisión del servicio.",

    [FindingType.UNKNOWN]: "Se produjo un error inesperado durante el diagnóstico. Se recomienda revisar los registros del sistema y realizar una validación manual."

};