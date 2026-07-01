import { GrammarToken } from "../grammarParser";

export type Result<T> = { success: true; value: T } | { success: false; reason: string; token: GrammarToken };
