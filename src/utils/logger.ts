export class Logger {
    private static reset = "\x1b[0m"

    private static colors = {
        info: "\x1b[36m",     // cyan
        success: "\x1b[32m",  // green
        warn: "\x1b[33m",     // yellow
        error: "\x1b[31m",    // red
        debug: "\x1b[35m"     // magenta
    };

    private static format(level: keyof typeof Logger.colors, message: any, context?: string) {
        const color = Logger.colors[level]

        const time = new Date().toISOString();

        const ctx = context ? `[${context}]` : "";

        return `${color}[${level.toUpperCase()}] ${time} ${ctx} ${message}${Logger.reset}`;
    }

    static info(message: any, context?: string) {
        console.log(this.format("info", message, context));
    }

    static success(message: any, context?: string) {
        console.log(this.format("success", message, context));
    }

    static warn(message: any, context?: string) {
        console.log(this.format("warn", message, context));
    }

    static error(message: any, context?: string) {
        console.log(this.format("error", message, context));
    }

    static debug(message: any, context?: string) {
        if (process.env.DEBUG === "true") {
            console.log(this.format("debug", message, context));
        }
    }
}