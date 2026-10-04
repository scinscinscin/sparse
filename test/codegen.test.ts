import { describe, expect, it } from "vitest";
import fs from "fs/promises";
import { buildStates, dehydateProduction, generateStates, tryBuildProductions } from "../src/index";
import { grammarLexerGenerator } from "../src/meta/selfhosted";
import { selfhosted as metaSelfHosted } from "../src/meta/states";
import { selfhosted as tableSelfHosted } from "../src/table/states";
import { examplePath, readFile } from "./helpers";

/**
 * Mirrors example/selfhosted/example.ts: the LR(1) states that Sparse uses to read its own grammar
 * and table file formats are generated from the grammar files in example/selfhosted, and the copies
 * checked into src/ have to be identical. If this test fails, the bootstrap is broken: either the
 * grammar files changed without regenerating the states, or the states changed without updating
 * the grammar files.
 */
const regen = async (grammarName: string) => {
  const grammar = await readFile(grammarName);
  const lexer = grammarLexerGenerator.generate(grammar, () => ({}));

  const productionsResult = tryBuildProductions(lexer);
  if (productionsResult.success === false) throw new Error(productionsResult.reason);
  const productions = productionsResult.value;

  const statesResult = generateStates(productions);
  if (statesResult.success === false) throw new Error(statesResult.reason);

  return {
    states: statesResult.value.toJSObject(),
    productions: productions.map(dehydateProduction),
  };
};

describe("self hosted code generation", () => {
  it("regenerates the states checked into src/meta/states.ts byte for byte", async () => {
    const regenerated = await regen("selfhosted/01-meta-grammar.txt");

    expect(regenerated).toEqual({ states: metaSelfHosted.states, productions: metaSelfHosted.productions });
  });

  it("regenerates the states checked into src/table/states.ts byte for byte", async () => {
    const regenerated = await regen("selfhosted/02-table-grammar.txt");

    expect(regenerated).toEqual({ states: tableSelfHosted.states, productions: tableSelfHosted.productions });
  });

  it("keeps the committed codegen files in example/selfhosted in sync", async () => {
    for (const [grammarName, codegenName] of [
      ["selfhosted/01-meta-grammar.txt", "selfhosted/codegen-meta.ts"],
      ["selfhosted/02-table-grammar.txt", "selfhosted/codegen-table.ts"],
    ]) {
      const regenerated = await regen(grammarName as string);
      const source = `export const states = ${JSON.stringify(regenerated.states, null, 2)};
    export const productions = ${JSON.stringify(regenerated.productions, null, 2)};
    export const selfhosted = { states, productions };`;

      expect(await fs.readFile(examplePath(codegenName as string), "utf8")).toBe(source);
    }
  });

  it("produces tables the library can read back", async () => {
    const regenerated = await regen("selfhosted/01-meta-grammar.txt");

    const fromJson = buildStates(
      regenerated.states
        .map((state) =>
          Object.entries(state)
            .map(([key, action]) => `${key}=${action.type === "goto" ? "" : action.type === "shift" ? "s" : "r"}${action.value}`)
            .join(", "),
        )
        .join("\n"),
    );

    expect(fromJson.length).toBe(regenerated.states.length);
  });
});