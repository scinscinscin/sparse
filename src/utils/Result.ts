import { GrammarToken } from "../meta/common";

export type Result<T> = { success: true; value: T } | { success: false; reason: string; token: GrammarToken };
