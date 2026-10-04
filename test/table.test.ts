import { describe, expect, it } from "vitest";
import {
  buildProductions,
  buildStates,
  generateStates,
  tryBuildStates,
  validateTable,
  validateTableStates,
  TableState,
  type TableState as TableStateType,
} from "../src/index";
import { EXAMPLE_GRAMMARS, readFile } from "./helpers";

const dump = (states: TableStateType[]) =>
  states.map((state) =>
    [...state.actions.entries()].map(([key, action]) => `${key}=${action.type === "goto" ? "" : action.type === "shift" ? "s" : "r"}${action.value}`),
  );

describe("table file parsing", () => {
  it("reads a hand written table", () => {
    const states = buildStates(`[EOF]=s1, <PROGRAM>=1\n[EOF]=r0\n`);
    expect(states.length).toBe(2);
    expect(states[0].getTerminalAction("EOF")).toEqual({ type: "shift", value: 1 });
    expect(states[0].getVariableAction("<PROGRAM>")).toEqual({ type: "goto", value: 1 });
    expect(states[1].getTerminalAction("EOF")).toEqual({ type: "reduce", value: 0 });
  });

  it("reports malformed actions as failures instead of silently accepting them", () => {
    const cases: [string, string, string][] = [
      ["wrong action prefix", `[A]=q3\n`, `"[A]=q3"`],
      ["non numeric shift", `[A]=sX\n`, `"[A]=sX"`],
      ["state out of range", `[A]=s99999\n`, "only has 1 states"],
    ];

    for (const [name, table, expected] of cases) {
      const result = tryBuildStates(table);
      expect(result.success, `${name} should fail`).toBe(false);
      if (result.success === false) expect(result.reason).toContain(expected);
    }
  });

  it("reports tables that are not tables at all", () => {
    for (const table of ["", "hello world\n", "A=s1\n"]) {
      const result = tryBuildStates(table);
      expect(result.success).toBe(false);
      if (result.success === false) expect(result.reason).toContain("Invalid syntax");
    }
  });

  it("throws from buildStates, mentioning the position", () => {
    expect(() => buildStates("hello world\n")).toThrow(/while parsing the parsing table at 1:\d+/);
  });

  it("rejects an empty table", () => {
    const result = validateTableStates([]);
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.reason).toContain("does not contain any states");
  });

  it("rejects state 0 without actions", () => {
    const result = validateTableStates([new TableState()]);
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.reason).toContain("State 0 has no actions");
  });

  it("rejects a terminal mapped to a goto", () => {
    const states = [new TableState(new Map([["[A]", { type: "goto" as const, value: 0 }]]))];
    const result = validateTableStates(states);
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.reason).toContain("variables can only be reached by a \"goto\"");
  });

  it("rejects a variable mapped to a shift", () => {
    const states = [new TableState(new Map([["<A>", { type: "shift" as const, value: 0 }]]))];
    const result = validateTableStates(states);
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.reason).toContain("variables can only be reached by a \"goto\"");
  });
});

describe("table generation and round trip", () => {
  it.each(EXAMPLE_GRAMMARS)("round trips the %s table through the table file format", async (_name, grammarPath) => {
    const grammar = await readFile(grammarPath);
    const productions = buildProductions(grammar);

    const result = generateStates(productions);
    if (result.success === false) throw new Error(result.reason);

    const fromMemory = result.value.toStates();
    const fromText = tryBuildStates(result.value.toTable(), { productions });
    if (fromText.success === false) throw new Error(fromText.reason);

    expect(dump(fromText.value)).toEqual(dump(fromMemory));
  });

  it("rebuilds the committed math table byte for byte", async () => {
    const committed = await readFile("math/table.txt");
    const productions = buildProductions(await readFile("math/grammar.txt"));
    const result = generateStates(productions);
    if (result.success === false) throw new Error(result.reason);
    expect(result.value.toTable().trim()).toBe(committed.trim());
  });

  it("rebuilds the committed LoLang table byte for byte", async () => {
    const committed = await readFile("LoLang/table.txt");
    const productions = buildProductions(await readFile("LoLang/grammar.txt"));
    const result = generateStates(productions);
    if (result.success === false) throw new Error(result.reason);
    expect(result.value.toTable().trim()).toBe(committed.trim());
  });

  it("keeps the JSON representation used for codegen stable", async () => {
    const productions = buildProductions(await readFile("math/grammar.txt"));
    const result = generateStates(productions);
    if (result.success === false) throw new Error(result.reason);

    const json = result.value.toJSObject();
    const restored = json.map((state) => TableState.fromJSObject(state));

    expect(dump(restored)).toEqual(dump(result.value.toStates()));
    expect(validateTableStates(restored, { productions }).success).toBe(true);
  });
});

describe("validateTable", () => {
  it("accepts a table that belongs to the grammar", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;\n<PROGRAM: program>: [EOF];\n`);
    const states = buildStates(`[EOF]=s1, <PROGRAM>=1\n[EOF]=r0\n`);
    expect(validateTable(productions, states).success).toBe(true);
  });

  it("rejects a stale table whose reduce actions point past the end of the grammar", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;\n<PROGRAM: program>: [EOF];\n`);
    const states = buildStates(`[EOF]=r7\n`);
    const result = validateTable(productions, states);
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.reason).toContain("Is the table stale?");
  });

  it("rejects an empty grammar", () => {
    const result = validateTable([], [new TableState(new Map([["[A]", { type: "reduce" as const, value: 0 }]]))]);
    expect(result.success).toBe(false);
  });
});