export const DiagnosticRules = {
    opticalPower: {
        excellent: {

            min: -24,

            max: -8

        },

        warning: {

            min: -27,

            max: -25

        },

        critical: {

            min: -40,

            max: -28

        }
    },
    runState: {

        online: "Online",

        offline: "Offline"

    }
}