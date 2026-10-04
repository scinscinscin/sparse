import path from "path";
import { ColumnAndRow, Token } from "@scinorandex/slex";
import { describe, expect, it } from "vitest";
import {
  LR1ParserGraveError,
  LR1StackSymbol,
  Sparse,
  SparseGrammarError,
  assertReducersCoverGrammar,
  buildProductions,
  buildStates,
  defineReducers,
  enumToString,
  loadGrammar,
  missingReducerNames,
  namedProductions,
} from "../src/index";
import {
  MathTokenType,
  SemiTokenType,
  mathLexer,
  readFile,
  root,
  semiLexer,
} from "./helpers";

type Node = { nodes: LR1StackSymbol<MathTokenType, {}, Node>[] };

class AstNode implements Node {
  constructor(public readonly nodes: LR1StackSymbol<MathTokenType, {}, Node>[]) {}
  toObject(): unknown[] {
    return this.nodes.map((node) => (node.type === "token" ? node.token.lexeme : (node.node as AstNode).toObject()));
  }
}

const reducer = (_newInput: any, oldInput: { input: LR1StackSymbol<MathTokenType, {}, Node>[] }) =>
  new AstNode(oldInput.input);

const toStringifiedTokenType = enumToString<MathTokenType>(MathTokenType);
const toSemiStringifiedTokenType = enumToString<SemiTokenType>(SemiTokenType);

const mathGrammarPath = path.join(root, "example/math/grammar.txt");
const mathTablePath = path.join(root, "example/math/table.txt");

describe("parsing", () => {
  it("parses a math expression from a prebuilt table", async () => {
    const generator = await Sparse.fromGrammarFile<MathTokenType, {}, Node>({
      grammarPath: mathGrammarPath,
      tablePath: mathTablePath,
      toStringifiedTokenType,
    });

    const result = generator.generate(mathLexer("2.4 + 3.5 * 1 / 456.789"), { reducer }).parse();

    expect(result.errors).toEqual([]);
    expect(result.result).not.toBe(null);
  });

  it("exposes the named symbols of the right hand side through the bag", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER: first] [EOF];
`);
    const generator = Sparse.fromProductions<MathTokenType, {}, unknown>({
      productions,
      toStringifiedTokenType,
      quiet: true,
    });

    const seen: unknown[] = [];
    generator
      .generate(mathLexer("1"), {
        reducer: (newInput) => {
          seen.push(newInput.name);
          if (newInput.name === "program")
            seen.push({ first: (newInput.bag.first as Token<MathTokenType, {}>).lexeme });
          return new AstNode([]);
        },
      })
      .parse();

    expect(seen).toEqual(["program", { first: "1" }]);
  });

  it("reports a syntax error with the position and the terminals it wanted", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: <EXPRESSION> [EOF];
<EXPRESSION: expression>: [NUMBER] ([PLUS] [NUMBER])*;
`);
    const generator = Sparse.fromProductions<MathTokenType, {}, Node>({
      productions,
      toStringifiedTokenType,
      quiet: true,
    });

    try {
      generator.generate(mathLexer("1 + "), { reducer }).parse();
      throw new Error("expected the parse to fail");
    } catch (err) {
      expect(err).toBeInstanceOf(LR1ParserGraveError);
      const message = (err as LR1ParserGraveError<MathTokenType, {}>).reason;
      expect(message).toContain("Invalid syntax at 1:4");
      expect(message).toContain("got EOF");
      expect(message).toContain("[NUMBER]");
      // gotos are not terminals, so they must not show up in the message
      expect(message).not.toContain("<");
    }
  });

  it("keeps the token that could not be parsed", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] [EOF];
`);
    const generator = Sparse.fromProductions<MathTokenType, {}, Node>({
      productions,
      toStringifiedTokenType,
      quiet: true,
    });

    try {
      generator.generate(mathLexer("1 1"), { reducer }).parse();
      throw new Error("expected the parse to fail");
    } catch (err) {
      expect(err).toBeInstanceOf(LR1ParserGraveError);
      const token = (err as LR1ParserGraveError<MathTokenType, {}>).currentToken;
      expect(token?.type).toBe(MathTokenType.NUMBER);
      expect(token?.lexeme).toBe("1");
      expect(token?.line).toBe(1);
    }
  });

  it("explains that the table does not match the grammar instead of crashing", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] [EOF];
`);
    // Reduce by production 0 (accept) for everything: syntactically valid, semantically nonsense.
    const generator = new Sparse<MathTokenType, {}, Node>({
      productions,
      states: buildStates(`[NUMBER]=r0\n`),
      toStringifiedTokenType,
      validate: true,
    });

    // Nothing gets shifted, so the parser has no tree to return rather than crashing on an empty stack.
    expect(generator.generate(mathLexer("1"), { reducer }).parse().result).toBe(null);
  });

  it("rejects a table that does not belong to the grammar when validate is on", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] [EOF];
`);

    expect(
      () =>
        new Sparse<MathTokenType, {}, Node>({
          productions,
          states: buildStates(`[EOF]=r9\n`),
          toStringifiedTokenType,
          validate: true,
        }),
    ).toThrow(/does not match the grammar/);
  });

  it("keeps the collected errors between reductions and clears them on reset", () => {
    const productions = buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] [SEMICOLON] [EOF];
`);
    const generator = Sparse.fromProductions<SemiTokenType, {}, unknown>({
      productions: productions as any,
      toStringifiedTokenType: toSemiStringifiedTokenType,
      quiet: true,
    });

    const parser = generator.generate(semiLexer("1"), {
      reducer: () => ({ tag: "reduced" }),
      recover({ lexer, insertToken, addError, finish }) {
        const next = lexer.peekNextToken();
        const inserted = insertToken(
          new Token<SemiTokenType, {}>(SemiTokenType.SEMICOLON, ";", new ColumnAndRow(next.line, next.column), {}),
        );
        if (inserted != null) return inserted;
        addError("inserted a semicolon");
        return finish();
      },
    });

    expect(parser.parse().errors).toHaveLength(1);
    parser.reset();

    // The lexer is exhausted, so the second run fails on the input rather than on leftover stacks.
    expect(() => parser.parse()).toThrow(/Cannot insert|Invalid syntax/);
  });
});

describe("error recovery", () => {
  const productionsWithSemicolon = () =>
    Sparse.fromProductions<SemiTokenType, {}, unknown>({
      productions: buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] [SEMICOLON] [EOF];
`),
      toStringifiedTokenType: toSemiStringifiedTokenType,
      quiet: true,
    });

  it("inserts a token that was missing from the input", () => {
    const generator = productionsWithSemicolon();
    const parser = generator.generate(semiLexer("1"), {
      reducer: () => ({ tag: "reduced" }),
      recover({ lexer, insertToken, addError, finish }) {
        const next = lexer.peekNextToken();
        const inserted = insertToken(
          new Token<SemiTokenType, {}>(SemiTokenType.SEMICOLON, ";", new ColumnAndRow(next.line, next.column), {}),
        );
        if (inserted != null) return inserted;
        addError("inserted a semicolon");
        return finish();
      },
    });

    const result = parser.parse();
    expect(result.errors.map((error) => error.message)).toEqual(["inserted a semicolon"]);
    expect(result.result).not.toBe(null);
  });

  it("records the position of the error it adds", () => {
    const generator = productionsWithSemicolon();
    const parser = generator.generate(semiLexer("1"), {
      reducer: () => null,
      recover({ insertToken, addError, finish, crash }) {
        const inserted = insertToken(
          new Token<SemiTokenType, {}>(SemiTokenType.SEMICOLON, ";", new ColumnAndRow(0, 0), {}),
        );
        if (inserted != null) return crash(inserted.reason);
        addError("inserted a semicolon");
        return finish();
      },
    });

    expect(parser.parse().errors[0].token.line).toBe(1);
  });

  it("refuses to insert a token the current state does not accept", () => {
    const generator = productionsWithSemicolon();
    let reason: string | null = null;

    const parser = generator.generate(semiLexer("1"), {
      reducer: () => null,
      recover({ insertToken, crash }) {
        // NUMBER is not shiftable at this point, so inserting it has to be refused.
        const inserted = insertToken(new Token<SemiTokenType, {}>(SemiTokenType.NUMBER, "1", new ColumnAndRow(0, 0), {}));
        if (inserted != null) {
          reason = inserted.reason;
          return inserted;
        }
        return crash("unreachable");
      },
    });

    expect(() => parser.parse()).toThrow(LR1ParserGraveError);
    expect(reason).toContain("Cannot insert");
  });
});

describe("reducer helpers", () => {
  const grammar = `<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] ([PLUS] [NUMBER])* [EOF];
`;

  it("lists the productions a grammar names", () => {
    expect(namedProductions(buildProductions(grammar))).toEqual(["autogenerated-kleene", "program"]);
  });

  it("names the reducers that are missing", () => {
    expect(missingReducerNames(buildProductions(grammar), { program: () => null })).toEqual([
      "autogenerated-kleene",
    ]);
  });

  it("explains that * and + need the autogenerated-kleene reducer", () => {
    expect(() => assertReducersCoverGrammar(buildProductions(grammar), { program: () => null })).toThrow(
      /autogenerated-kleene/,
    );
  });

  it("says which reducers it does have", () => {
    expect(() => assertReducersCoverGrammar(buildProductions(grammar), {})).toThrow(/Your reducer map is empty/);
  });

  it("dispatches to the reducer named in the grammar", () => {
    const generator = Sparse.fromProductions<MathTokenType, {}, string>({
      productions: buildProductions(grammar),
      toStringifiedTokenType,
      quiet: true,
    });

    const parser = generator.generate(mathLexer("1 + 2"), {
      reducer: defineReducers({ program: () => "program", "autogenerated-kleene": () => "list" }),
    });

    expect(parser.parse().result).toBe("program");
  });

  it("throws a named error when a reducer is missing at parse time", () => {
    const generator = Sparse.fromProductions<MathTokenType, {}, string>({
      productions: buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] [EOF];
`),
      toStringifiedTokenType,
      quiet: true,
    });

    expect(() => generator.generate(mathLexer("1"), { reducer: defineReducers({}) }).parse()).toThrow(
      /No reducer for production "program"/,
    );
  });

  it("surfaces the reducer's own message when a reducer throws", () => {
    const generator = Sparse.fromProductions<MathTokenType, {}, string>({
      productions: buildProductions(`<S>: <PROGRAM>;
<PROGRAM: program>: [NUMBER] [EOF];
`),
      toStringifiedTokenType,
      quiet: true,
    });

    try {
      generator
        .generate(mathLexer("1"), {
          reducer: () => {
            throw new Error("I refuse");
          },
        })
        .parse();
      throw new Error("expected the parse to fail");
    } catch (err) {
      expect((err as LR1ParserGraveError<MathTokenType, {}>).reason).toContain("I refuse");
      expect((err as LR1ParserGraveError<MathTokenType, {}>).reason).toContain('("program")');
      expect((err as Error).cause).toBeInstanceOf(Error);
    }
  });
});

describe("loading grammars and tables from disk", () => {
  it("reads a grammar from disk", async () => {
    const result = await loadGrammar(mathGrammarPath);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.length).toBeGreaterThan(0);
  });

  it("turns a missing file into a failure", async () => {
    const result = await loadGrammar(path.join(root, "example/nope.txt"));
    expect(result.success).toBe(false);
  });

  it("returns a Result instead of throwing when the grammar is missing", async () => {
    const result = await Sparse.tryFromGrammarFile<MathTokenType, {}, Node>({
      grammarPath: path.join(root, "example/math/does-not-exist.txt"),
      tablePath: mathTablePath,
      toStringifiedTokenType,
    });

    expect(result.success).toBe(false);
    if (result.success === false) expect(result.reason).toContain("Could not read the grammar file");
  });

  it("reports a table that does not match the grammar", async () => {
    const wrongTable = path.join(root, "example/kleene-test/grammar.txt");
    const result = await Sparse.tryFromGrammarFile<MathTokenType, {}, Node>({
      grammarPath: mathGrammarPath,
      tablePath: wrongTable,
      toStringifiedTokenType,
    });

    expect(result.success).toBe(false);
    if (result.success === false) expect(result.reason).toContain(wrongTable);
  });

  it("throws SparseGrammarError with a position", async () => {
    await expect(
      Sparse.fromGrammarFile<MathTokenType, {}, Node>({
        grammarPath: mathGrammarPath,
        tablePath: mathGrammarPath,
        toStringifiedTokenType,
      }),
    ).rejects.toThrow(SparseGrammarError);
  });

  it("keeps the math grammar's structure intact", async () => {
    const productions = buildProductions(await readFile("math/grammar.txt"));
    expect(productions.map((production) => production.identifier)).toContain("<FACTOR_EXPRESSION>");
    expect(productions.every((production) => production.rhs.length > 0)).toBe(true);
  });
});