import { describe, expect, it, beforeAll } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { examplePath, root } from "./helpers";

const exec = promisify(execFile);

let cli = path.join(root, "dist/cli.js");
let tmp: string;

type Run = { code: number; stdout: string; stderr: string };

const run = async (...args: string[]): Promise<Run> => {
  try {
    const { stdout, stderr } = await exec("node", [cli, ...args], { cwd: root });
    return { code: 0, stdout, stderr };
  } catch (err) {
    const failure = err as { code?: number; stdout: string; stderr: string };
    return { code: failure.code ?? 1, stdout: failure.stdout ?? "", stderr: failure.stderr ?? "" };
  }
};

beforeAll(async () => {
  await exec("node", ["node_modules/typescript/bin/tsc", "-p", "tsconfig.build.json"], { cwd: root });
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "sparse-cli-"));
}, 180_000);

describe("the sparse CLI", () => {
  it("prints usage for --help and exits successfully", async () => {
    const result = await run("--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Usage: npx @scinorandex/sparse --input=<grammar> --output=<table>");
    expect(result.stdout).toContain("--lalr");
    expect(result.stdout).toContain("--check");
  });

  it("fails with usage when --input is missing", async () => {
    const result = await run("--output=" + path.join(tmp, "table.txt"));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Missing --input");
  });

  it("fails when the grammar does not exist", async () => {
    const result = await run(`--input=${path.join(tmp, "nope.txt")}`, `--output=${path.join(tmp, "table.txt")}`);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("does not exist");
  });

  it("creates the output directory", async () => {
    const output = path.join(tmp, "nested", "deeper", "table.txt");
    const result = await run(`--input=${examplePath("math/grammar.txt")}`, `--output=${output}`);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("22 LR(1) states");
    expect(await fs.readFile(output, "utf8")).toBe(await fs.readFile(examplePath("math/table.txt"), "utf8"));
  });

  it("reproduces the committed math table", async () => {
    const output = path.join(tmp, "math.txt");
    await run(`--input=${examplePath("math/grammar.txt")}`, `--output=${output}`);

    expect((await fs.readFile(output, "utf8")).trim()).toBe(
      (await fs.readFile(examplePath("math/table.txt"), "utf8")).trim(),
    );
  });

  it("prints the table to stdout", async () => {
    const result = await run(`--input=${examplePath("math/grammar.txt")}`, "--stdout");
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe((await fs.readFile(examplePath("math/table.txt"), "utf8")).trim());
  });

  it("shows a window into the grammar when the grammar is broken", async () => {
    const grammarPath = path.join(tmp, "broken.txt");
    await fs.writeFile(grammarPath, "<S>: <PROGRAM>;\n<PROGRAM: program>: [NUMBER] (;\n");

    const result = await run(`--input=${grammarPath}`, `--output=${path.join(tmp, "broken-table.txt")}`);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Invalid syntax at 2:30");
    expect(result.stderr).toContain("<PROGRAM: program>: [NUMBER] (");
    expect(result.stderr).toContain("~");
    expect(result.stderr).not.toContain("at Object.");
  });

  it("reports a grammar that references an undefined variable", async () => {
    const grammarPath = path.join(tmp, "dangling.txt");
    await fs.writeFile(grammarPath, "<S>: <PROGRAM>;\n<PROGRAM: program>: [NUMBER] <NOPE> [EOF];\n");

    const result = await run(`--input=${grammarPath}`, `--output=${path.join(tmp, "dangling-table.txt")}`);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`Variable "<NOPE>"`);
  });

  it("warns about a suspicious grammar rule but still writes the table", async () => {
    const grammarPath = path.join(tmp, "duplicate.txt");
    const output = path.join(tmp, "duplicate-table.txt");
    await fs.writeFile(grammarPath, "<S>: <PROGRAM>;\n<PROGRAM: program>: [NUMBER: n] [EOF: n];\n");

    const result = await run(`--input=${grammarPath}`, `--output=${output}`);

    expect(result.code).toBe(0);
    expect(result.stderr).toContain("names more than one symbol");

    const quiet = await run(`--input=${grammarPath}`, `--output=${output}`, "--quiet");
    expect(quiet.stderr).toBe("");
  });

  it("accepts a table that is up to date with --check", async () => {
    const output = path.join(tmp, "check.txt");
    await run(`--input=${examplePath("math/grammar.txt")}`, `--output=${output}`);

    const result = await run(`--input=${examplePath("math/grammar.txt")}`, `--output=${output}`, "--check");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("is up to date");
  });

  it("reports a stale table with --check", async () => {
    const grammar = "<S>: <PROGRAM>;\n<PROGRAM: program>: [NUMBER] [EOF];\n";
    const grammarPath = path.join(tmp, "check-grammar.txt");
    const output = path.join(tmp, "check-stale.txt");
    await fs.writeFile(grammarPath, grammar);
    await fs.writeFile(output, "[EOF]=r0\n");

    const result = await run(`--input=${grammarPath}`, `--output=${output}`, "--check");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("is out of date");
  });

  it("reports a table file that is not a table", async () => {
    const grammarPath = path.join(tmp, "check-grammar2.txt");
    const output = path.join(tmp, "check-garbage.txt");
    await fs.writeFile(grammarPath, "<S>: <PROGRAM>;\n<PROGRAM: program>: [EOF];\n");
    await fs.writeFile(output, "hello world\n");

    const result = await run(`--input=${grammarPath}`, `--output=${output}`, "--check");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("not a valid parsing table");
  });
});
