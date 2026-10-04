import { GrammarToken, syntheticGrammarToken } from "../meta/common";
import type { Production } from "../meta/common";
import type { TableAction, TableState } from "../parser";
import { Result } from "../utils/Result";

const SHIFT_REDUCE_RE = /^([sr])(\d+)$/;
const GOTO_RE = /^(\d+)$/;

const defaultRawAction = (action: TableAction): string =>
  `${action.type === "goto" ? "" : action.type === "shift" ? "s" : "r"}${action.value}`;;

const STATE_NAME_PATTERN = /^(\[[^\]]+\]|<[^>]+>)$/;

export type TableFormatWarning = { reason: string; stateIndex: number };

export type ValidateTableStatesOptions = {
  /** When provided, every "reduce" action is checked against the number of productions. */
  productions?: Production[];
  /** Name of the file the table was read from, used to make error messages actionable. */
  source?: string;
  onWarning?: (warning: TableFormatWarning) => void;
};

/**
 * Validates the shape of a parsing table: action syntax, and that every state a transition points
 * at actually exists. Without this, a typo in a table file silently turns into nonsense behavior
 * (`[A]=q3` becomes "reduce by production 3", `[A]=sX` becomes "shift to state NaN").
 */
export const validateTableStates = (
  states: TableState[],
  options: ValidateTableStatesOptions = {},
): Result<TableState[]> => {
  const { productions, source } = options;
  const suffix = source == null ? "" : ` in ${source}`;
  const stateCount = states.length;

  const fail = (reason: string, stateIndex: number): Result<TableState[]> => ({
    success: false,
    reason: `${reason}${suffix}`,
    token: tokenFor(stateIndex, productions),
  });

  if (stateCount === 0)
    return {
      success: false,
      reason: `The parsing table${suffix} does not contain any states`,
      token: syntheticGrammarToken(),
    };

  for (let stateIndex = 0; stateIndex < stateCount; stateIndex++) {
    const state = states[stateIndex];
    if (state == null) return fail(`State ${stateIndex} is missing`, stateIndex);

    if (stateIndex === 0 && state.actions.size === 0)
      return fail("State 0 has no actions, so the parser cannot read the first token", stateIndex);

    for (const [key, action] of state.actions.entries()) {
      const nameMatch = STATE_NAME_PATTERN.exec(key);
      if (nameMatch == null)
        return fail(
          `State ${stateIndex} has the entry "${key}", which is neither a terminal "[NAME]" nor a variable "<NAME>"`,
          stateIndex,
        );

      const isVariable = nameMatch[1].startsWith("<");
      if (isVariable !== (action.type === "goto"))
        return fail(
          `State ${stateIndex} maps the variable "${key}" to a "${action.type}" action, but variables can only be reached by a "goto" action`,
          stateIndex,
        );

      // Prefer the text the user actually wrote: "[A]=q3" parses into a "reduce 3" action that
      // looks valid unless you remember that "q3" is not a valid action.
      const raw = state.rawActions.get(key) ?? defaultRawAction(action);
      const expected = isVariable ? GOTO_RE : SHIFT_REDUCE_RE;
      if (expected.test(raw) === false || Number.isInteger(action.value) === false)
        return fail(
          `State ${stateIndex} has the action "${key}=${raw}" for ${isVariable ? "a variable" : "a terminal"}, but it should be ${
            isVariable ? "a state number" : '"sN" (shift) or "rN" (reduce)'
          }`,
          stateIndex,
        );

      if (isVariable || action.type === "shift") {
        if (action.value >= stateCount)
          return fail(
            `State ${stateIndex} sends "${key}" to state ${action.value}, but the table only has ${stateCount} states (0 to ${stateCount - 1})`,
            stateIndex,
          );
      } else if (productions != null && action.value >= productions.length)
        return fail(
          `State ${stateIndex} reduces "${key}" by production ${action.value}, but the grammar only has ${productions.length} productions (0 to ${productions.length - 1}). Is the table stale?`,
          stateIndex,
        );
    }

    const shiftTargets = new Set<number>();
    for (const action of state.actions.values()) {
      if (action.type !== "shift") continue;
      if (shiftTargets.has(action.value))
        options.onWarning?.({
          reason: `State ${stateIndex} has two terminals that shift to state ${action.value}`,
          stateIndex,
        });
      shiftTargets.add(action.value);
    }
  }

  return { success: true, value: states };
};

export type ValidateTableOptions = { source?: string };

/**
 * Cross-checks a prebuilt parsing table against the productions it is supposed to belong to.
 * Catches the class of bug where a table is regenerated but the grammar is not (or vice versa),
 * which otherwise shows up as an opaque crash in the middle of a parse.
 */
export const validateTable = (
  productions: Production[],
  states: TableState[],
  options: ValidateTableOptions = {},
): Result<TableState[]> => {
  const statesResult = validateTableStates(states, { ...options, productions });
  if (statesResult.success === false) return statesResult;

  const suffix = options.source == null ? "" : ` in ${options.source}`;
  if (productions.length === 0)
    return {
      success: false,
      reason: `The grammar${suffix} does not contain any productions, so the table cannot belong to it`,
      token: syntheticGrammarToken(),
    };

  return { success: true, value: states };
};

/** Errors about a table are reported against the closest grammar token, or 1:1 when unavailable. */
const tokenFor = (stateIndex: number, productions: Production[] | undefined): GrammarToken => {
  if (productions != null && productions.length > 0)
    return productions[Math.min(stateIndex, productions.length - 1)].lhs;
  return syntheticGrammarToken();
};