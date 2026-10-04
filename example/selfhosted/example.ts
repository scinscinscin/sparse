import fs from "fs/promises";
import path from "path";
import { buildErrorWindow, generateStates, tryBuildProductions } from "../../src";
import { grammarLexerGenerator } from "../../src/meta/selfhosted";
import { dehydateProduction } from "../../src/meta/common";

const root = path.join(__dirname, "..", "..");

/**
 * Regenerates the LR(1) states that Sparse uses to read its own grammar and table file formats.
 * `src/meta/states.ts` and `src/table/states.ts` are byte-identical copies of the two files this
 * writes, so after running this you must copy them over.
 */
async function codegen(name: string, grammarName: string, outputPath: string) {
  const grammarPath = path.join(root, "example/selfhosted", grammarName);
  const grammar = await fs.readFile(grammarPath, "utf8");

  const lexer = grammarLexerGenerator.generate(grammar, () => ({}));
  const productionsResult = tryBuildProductions(lexer);
  if (productionsResult.success === false) {
    console.error(`${productionsResult.reason}\n${buildErrorWindow(grammar, productionsResult.token)}`);
    process.exitCode = 1;
    return;
  }
  const productions = productionsResult.value;

  const statesResult = generateStates(productions);
  if (statesResult.success === false) {
    console.error(`${statesResult.reason}\n${buildErrorWindow(grammar, statesResult.token)}`);
    process.exitCode = 1;
    return;
  }

  await fs.writeFile(
    path.join(root, "example/selfhosted", outputPath),
    `export const states = ${JSON.stringify(statesResult.value.toJSObject(), null, 2)};
    export const productions = ${JSON.stringify(productions.map(dehydateProduction), null, 2)};
    export const selfhosted = { states, productions };`,
  );

  console.log(`${name}: ${productions.length} productions, ${statesResult.value.states.length} states -> ${outputPath}`);
}

codegen("meta grammar", "01-meta-grammar.txt", "codegen-meta.ts");
codegen("table grammar", "02-table-grammar.txt", "codegen-table.ts");