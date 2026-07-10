import { FindingType } from "../../../domain/diagnostic/enums/finding.type.js";

export const DiagnosticMessages = {
    [FindingType.ONU_OFFLINE]: {
        title: "ONU fuera de linea",
        description: "Solicita al cliente una fotografía o un video donde puedan observarse claramente los LEDs del equipo. Si el LED PON o LOS parpadea en color rojo, coordina una visita técnica."
    },
    [FindingType.LOW_POWER]: {
        title:

            "Potencia óptica baja",

        description:

            "La potencia óptica recibida está fuera del rango recomendado."

    }
}