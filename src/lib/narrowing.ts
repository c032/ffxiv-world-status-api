export function isArray(value: unknown): value is unknown[] {
	return !!value && Array.isArray(value);
}

export function isObject(
	value: unknown,
): value is Record<string, unknown | undefined> {
	return !!value && typeof value === "object";
}

export function asString(value: unknown): string {
	if (typeof value !== "string") {
		throw new Error("value is not a string");
	}

	return value;
}

export function asBoolean(value: unknown): boolean {
	if (typeof value !== "boolean") {
		throw new Error("value is not boolean");
	}

	return value;
}
