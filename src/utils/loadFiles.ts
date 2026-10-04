import fs from "fs/promises";
import { Production, ValidateProductionsOptions, syntheticGrammarToken } from "../meta/common";
import { Result } from "./Result";
import { BuildStatesOptions, tryBuildStates } from "../table/selfhosted";
import { tryBuildProductions } from "../meta/selfhosted";
import type { TableState } from "../parser";

export type LoadGrammarOptions = ValidateProductionsOptions;

/** Reads a `.txt` grammar file and turns it into productions, reporting problems as a `Result`. */
export const loadGrammar = async (
  grammarPath: string,
  options: LoadGrammarOptions = {},
): Promise<Result<Production[]>> => {
  let source: string;
  try {
    source = await fs.readFile(grammarPath, "utf8");
  } catch (err) {
    return {
      success: false,
      reason: `Could not read the grammar file: ${err instanceof Error ? err.message : String(err)}`,
      token: syntheticGrammarToken(),
    };
  }

  const result = tryBuildProductions(source, options);
  if (result.success === false)
    return { ...result, reason: `${result.reason} (in ${grammarPath})` };
  return result;
};

export type LoadTableOptions = Omit<BuildStatesOptions, "source">;

/** Reads a parsing table file written by the CLI, reporting problems as a `Result`. */
export const loadTable = async (
  tablePath: string,
  options: LoadTableOptions = {},
): Promise<Result<TableState[]>> => {
  let source: string;
  try {
    source = await fs.readFile(tablePath, "utf8");
  } catch (err) {
    return {
      success: false,
      reason: `Could not read the parsing table file: ${err instanceof Error ? err.message : String(err)}`,
      token: syntheticGrammarToken(),
    };
  }

  const result = tryBuildStates(source, { ...options, source: tablePath });
  if (result.success === false)
    return { ...result, reason: `${result.reason} (in ${tablePath})` };
  return result;
};