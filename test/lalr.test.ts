import { describe, expect, it } from "vitest";
import fs from "fs/promises";
import {
  LR1StackSymbol,
  Sparse,
  buildProductions,
  buildStates,
  enumToString,
  generateStates,
} from "../src/index";
import { MathTokenType, mathLexer, readFile } from "./helpers";
import { lexerGenerator as loLangLexerGenerator, LoLangTokenType } from "../example/LoLang/example";

type StackSymbol = LR1StackSymbol<any, any, AstNode>;

class AstNode {
  constructor(public readonly nodes: StackSymbol[]) {}
  toObject(): unknown[] {
    return this.nodes.map((node) => (node.type === "token" ? node.token.lexeme : (node.node as AstNode).toObject()));
  }
}

const reducer = (_newInput: any, oldInput: { input: LR1StackSymbol<any, any, AstNode>[] }) =>
  new AstNode(oldInput.input);

const toStringifiedTokenType = enumToString<MathTokenType>(MathTokenType);
const MATH_GRAMMAR = `${__dirname}/../example/math/grammar.txt`;
const EXPRESSIONS = ["1 + 2", "42", "3 * 4 - 5 / 6", "1.5 + 2.25 * 3"];

const mathTable = async () => buildStates(await fs.readFile(`${__dirname}/../example/math/table.txt`, "utf8"));

describe("LALR(1)", () => {
  it("produces the same trees as the committed LR(1) table for math expressions", async () => {
    const productions = buildProductions(await fs.readFile(MATH_GRAMMAR, "utf8"));
    const states = await mathTable();

    const fromTable = new Sparse<MathTokenType, {}, AstNode>({ productions, states, toStringifiedTokenType });
    const fromLalr = Sparse.fromProductions<MathTokenType, {}, AstNode>({
      productions,
      toStringifiedTokenType,
      mode: "lalr1",
      quiet: true,
    });

    for (const expression of EXPRESSIONS) {
      const lr1 = fromTable.generate(mathLexer(expression), { reducer }).parse().result?.toObject();
      const lalr = fromLalr.generate(mathLexer(expression), { reducer }).parse().result?.toObject();
      expect(lalr, `parsing "${expression}"`).toEqual(lr1);
    }
  });

  it("agrees with LR(1) on the LoLang example", async () => {
    const productions = buildProductions(await readFile("LoLang/grammar.txt"));
    const source = await readFile("LoLang/Features_Array_Methods.lol");

    const lr1 = generateStates(productions);
    const lalr = generateStates(productions, { mode: "lalr1" });
    if (lr1.success === false || lalr.success === false) throw new Error("generation failed");

    const parse = (states: any[]) =>
      new Sparse<LoLangTokenType, {}, AstNode>({
        productions,
        states,
        toStringifiedTokenType: enumToString<LoLangTokenType>(LoLangTokenType),
        validate: true,
      })
        .generate(loLangLexerGenerator.generate(source, () => ({})), { reducer })
        .parse().result?.toObject();

    const fromLr1 = parse(lr1.value.toStates());
    const fromLalr = parse(lalr.value.toStates());

    expect(fromLalr).toEqual(fromLr1);
  }, 120_000);

  it("is never larger than LR(1)", async () => {
    const productions = buildProductions(await readFile("LoLang/grammar.txt"));

    const lr1 = generateStates(productions);
    const lalr = generateStates(productions, { mode: "lalr1" });
    if (lr1.success === false || lalr.success === false) throw new Error("generation failed");

    expect(lalr.value.toStates().length).toBeLessThan(lr1.value.toStates().length);
  }, 120_000);

  it("builds the same table in both modes for an unambiguous grammar", () => {
    const productions = buildProductions(`<S>: <A>;
<A: a>: [A] [PLUS] [A];
<A: a>: [ID];
`);

    const lr1 = generateStates(productions);
    const lalr = generateStates(productions, { mode: "lalr1" });
    if (lr1.success === false || lalr.success === false) throw new Error("generation failed");

    expect(lalr.value.toTable()).toBe(lr1.value.toTable());
  });

  it("refuses to serialize a grammar that has a state without actions", () => {
    const productions = buildProductions(`<S>: <A>;
<A>: <A> <C>;
<B>: <A> [d] <C>;
<B>: <C> <C>;
<C>: <A>;
`);
    const result = generateStates(productions);
    if (result.success === false) throw new Error(result.reason);

    // The states are usable in memory...
    expect(result.value.toStates().some((state) => state.actions.size === 0)).toBe(true);
    // ...but the table file format has no way to express a state without actions.
    expect(() => result.value.toTable()).toThrow(/has no actions/);
  });
});