import fs from "fs/promises";
import { generateStates } from "../../src";
import { buildProductions, grammarLexerGenerator } from "../../src/meta/selfhosted";
import { dehydateProduction } from "../../src/meta/common";

async function codegenMetaGrammar() {
  const grammar = await fs.readFile("./example/selfhosted/01-meta-grammar.txt", "utf8");

  const lexer = grammarLexerGenerator.generate(grammar, () => ({}));
  const productions = buildProductions(lexer);
  const statesResult = generateStates(productions);
  if (statesResult.success === false) throw new Error(statesResult.reason);

  await fs.writeFile(
    "./example/selfhosted/codegen-meta.ts",
    `export const states = ${JSON.stringify(statesResult.value.toJSObject(), null, 2)};
    export const productions = ${JSON.stringify(productions.map(dehydateProduction), null, 2)};
    export const selfhosted = { states, productions };`,
  );
}

async function codegenTableGrammar() {
  const grammar = await fs.readFile("./example/selfhosted/02-table-grammar.txt", "utf8");

  const lexer = grammarLexerGenerator.generate(grammar, () => ({}));
  const productions = buildProductions(lexer);
  const statesResult = generateStates(productions);
  if (statesResult.success === false) throw new Error(statesResult.reason);

  await fs.writeFile(
    "./example/selfhosted/codegen-table.ts",
    `export const states = ${JSON.stringify(statesResult.value.toJSObject(), null, 2)};
    export const productions = ${JSON.stringify(productions.map(dehydateProduction), null, 2)};
    export const selfhosted = { states, productions };`,
  );
}

codegenMetaGrammar();
codegenTableGrammar();
