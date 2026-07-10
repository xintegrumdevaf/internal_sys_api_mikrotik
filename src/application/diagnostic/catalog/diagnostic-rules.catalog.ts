export const DiagnosticRules = {
    opticalPower: {
        excellent: {

            min: -24,

            max: -8

        },

        warning: {

            min: -27,

            max: -24

        },

        critical: {

            min: -40,

            max: -27

        }
    },
    runState: {

        online: "Online",

        offline: "Offline"

    }
}