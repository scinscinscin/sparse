#! /usr/bin/env node
import fs from "fs/promises";
import { GrammarToken, tryBuildProductions } from "./grammarParser";
import { generateStates } from "./generator";
import minimist from "minimist";
import path from "path";
import { buildErrorWindow } from "./utils/errorWindowBuilder";

const args = minimist(process.argv.slice(2));

function checkFileExists(filepath: string) {
  return new Promise<boolean>((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

async function main() {
  if (typeof args.input !== "string" || typeof args.output !== "string") {
    console.log("Usage: npx @scinorandex/sparse --input=<input> --output=<output>");
    return;
  }

  const inputFile = path.resolve(args.input);
  const outputFile = path.resolve(args.output);
  console.log(`Reading grammar from ${inputFile} and outputting table to ${outputFile}\n`);

  if (!(await checkFileExists(inputFile))) return console.log(`File ${inputFile} does not exist`);

  const grammar = await fs.readFile(args.input, "utf8");
  const productionsResult = tryBuildProductions(grammar);
  if (productionsResult.success === false) {
    console.log(productionsResult.reason);
    console.log(buildErrorWindow(grammar, productionsResult.token));
    return;
  }

  const generatorResult = generateStates(productionsResult.value);
  if (generatorResult.success === false) {
    console.log(generatorResult.reason);
    console.log(buildErrorWindow(grammar, generatorResult.token));
    return;
  }

  await fs.writeFile(outputFile, generatorResult.value.toTable(), { encoding: "utf-8" });
}

main();
