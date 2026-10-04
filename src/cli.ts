#! /usr/bin/env node
import fs from "fs/promises";
import path from "path";
import minimist from "minimist";
import { tryBuildProductions, tryBuildStates, generateStates, validateTable, buildErrorWindow } from "./index";
import type { GeneratorResult, ProductionWarning } from "./index";

const args = minimist(process.argv.slice(2));

const BINARY_NAME = "@scinorandex/sparse";

const USAGE = `Usage: npx @scinorandex/sparse --input=<grammar> --output=<table> [options]

Generates an LR(1) parsing table from a grammar file.

Required:
  --input=<file>        Grammar file to read
  --output=<file>       Where to write the parsing table (created if the directory is missing)

Options:
  --lalr                Generate LALR(1) states instead of LR(1) (smaller table, ~35% faster parsing)
  --check               Do not write anything: verify that <output> already matches the grammar
  --stdout              Print the table instead of writing it to a file
  --quiet               Do not print warnings about suspicious grammar rules
  --help                Show this message

Run with npx ${BINARY_NAME} (the package is @scinorandex/sparse).`;

function fail(message: string) {
  console.error(message);
  process.exitCode = 1;
}

/** Serializing can fail for grammars the table file format cannot express; report that, not a stack trace. */
function toTableOrFail(result: GeneratorResult): string | null {
  try {
    return result.toTable();
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function main() {
  if (args.help === true || args.h === true) {
    console.log(USAGE);
    return;
  }

  if (typeof args.input !== "string") {
    fail(`Missing --input.\n\n${USAGE}`);
    return;
  }

  const useStdout = args.stdout === true;
  const check = args.check === true;
  if (typeof args.output !== "string" && !useStdout) {
    fail(`Missing --output.\n\n${USAGE}`);
    return;
  }

  const inputFile = path.resolve(args.input);
  const outputFile = typeof args.output === "string" ? path.resolve(args.output) : undefined;

  let grammar: string;
  try {
    grammar = await fs.readFile(inputFile, "utf8");
  } catch {
    fail(`Cannot read grammar file ${inputFile}: it does not exist.`);
    return;
  }

  const onWarning = (warning: ProductionWarning) => {
    if (args.quiet === true) return;
    console.error(`Warning in ${inputFile} at ${warning.token.line}:${warning.token.column}: ${warning.reason}`);
  };

  const productionsResult = tryBuildProductions(grammar, { onWarning });
  if (productionsResult.success === false) {
    fail(`${productionsResult.reason}\n\n${buildErrorWindow(grammar, productionsResult.token)}`);
    return;
  }
  const productions = productionsResult.value;

  if (check) {
    if (outputFile == null) {
      fail(`--check needs --output to know which table to check.\n\n${USAGE}`);
      return;
    }

    let existingTable: string;
    try {
      existingTable = await fs.readFile(outputFile, "utf8");
    } catch {
      fail(`Cannot check ${outputFile}: it does not exist.`);
      return;
    }

    const statesResult = tryBuildStates(existingTable, { productions });
    if (statesResult.success === false) {
      fail(`The existing table is not a valid parsing table:\n${statesResult.reason}`);
      return;
    }

    const tableCheckResult = validateTable(productions, statesResult.value, { source: outputFile });
    if (tableCheckResult.success === false)
      fail(`The existing table does not match the grammar:\n${tableCheckResult.reason}`);

    const expected = generateStates(productions, { mode: args.lalr === true ? "lalr1" : "lr1" });
    if (expected.success === false) {
      fail(`${expected.reason}\n\n${buildErrorWindow(grammar, expected.token)}`);
      return;
    }

    const expectedTable = toTableOrFail(expected.value);
    if (expectedTable == null) return;
    const actualTable = existingTable.trim();

    if (expectedTable !== actualTable) {
      fail(
        `${outputFile} is out of date with respect to ${inputFile}.\n` +
          `Re-run without --check to regenerate it${args.lalr === true ? " (with --lalr)" : ""}.`,
      );
      return;
    }

    console.log(
      `${outputFile} is up to date with respect to ${inputFile} (${expectedTable.split("\n").length} states).`,
    );
    return;
  }

  const generatorResult = generateStates(productions, { mode: args.lalr === true ? "lalr1" : "lr1" });
  if (generatorResult.success === false) {
    fail(`${generatorResult.reason}\n\n${buildErrorWindow(grammar, generatorResult.token)}`);
    return;
  }

  const table = toTableOrFail(generatorResult.value);
  if (table == null) return;

  if (useStdout) {
    console.log(table);
    return;
  }

  if (outputFile == null) return;

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, table, { encoding: "utf-8" });

  const stateCount = table === "" ? 0 : table.split("\n").length;
  console.log(
    `Wrote ${stateCount} ${args.lalr === true ? "LALR(1)" : "LR(1)"} states from ${inputFile} to ${outputFile}.`,
  );
}

main();
