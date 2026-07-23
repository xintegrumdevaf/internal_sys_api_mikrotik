export function validateRequiredFields<T extends Record<string, unknown>>(
    body: T,
    requiredFields: readonly (keyof T)[]
): (keyof T)[] {
    return requiredFields.filter((field) => {
        const value = body[field];

        return (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "")
        );
    });
}