## Sparse - Scin's Parsing Library

Sparse allows developers to easily create LR(1) parsers and LR(1) parsing tables.

**Features:**
 - Complete Error Handling API - when parsing fails, you have the final say on where parsing stops
 - Deferred Reductions - you create the nodes and Sparse builds the tree
 - Grammar and table validation - mistakes are reported with the line, column and a window into your file
 - Full [Slex](https://github.com/scinscinscin/slex) integration - define your entire language as a set of DFA and CFG rules
 - Optional Table Output - use Sparse to build your tables for use in other languages

## Table of contents

- [Getting started](#getting-started)
- [Grammar syntax reference](#grammar-syntax-reference)
- [Building a parser](#building-a-parser)
- [Reducers](#reducers)
- [Repetition with `*` and `+`](#repetition-with--and-)
- [Error recovery](#error-recovery)
- [Generating and shipping the parsing table](#generating-and-shipping-the-parsing-table)
- [API reference](#api-reference)
- [Known limitations](#known-limitations)

## Getting started

1. **Define the CFG of your language.**

The CFG is defined by creating a file containing a list of productions. Variables are identifiers encased in angle brackets like `<STATEMENT>`, while terminals are encased in square-brackets like `[L_COLON]`.

An example production includes: `<IF_STATEMENT> : [IF] [L_PAREN] <EXPRESSION> [R_PAREN] <STATEMENT> [ELSE] <STATEMENT>;`.

An example CFG for a basic MDAS calculator is the following:

```
<S>: <PROGRAM>;
<PROGRAM>: <EXPRESSION> [EOF];
<PROGRAM>: [EOF];

// Begin parsing arithmetic expressions
<EXPRESSION>: <TERM_EXPRESSION>;
<TERM_EXPRESSION>: <FACTOR_EXPRESSION> [PLUS] <TERM_EXPRESSION>;
<TERM_EXPRESSION>: <FACTOR_EXPRESSION> [MINUS] <TERM_EXPRESSION>;
<TERM_EXPRESSION>: <FACTOR_EXPRESSION>;
<FACTOR_EXPRESSION>: <ENDPOINT> [STAR] <FACTOR_EXPRESSION>;
<FACTOR_EXPRESSION>: <ENDPOINT> [FORWARD_SLASH] <FACTOR_EXPRESSION>;
<FACTOR_EXPRESSION>: <ENDPOINT>;
<ENDPOINT>: [NUMBER];
```

The first production has to be the "accept" production: a variable that appears nowhere else, whose body is a single variable. It is the only production whose reducer Sparse never calls.

2. **Create your [Slex](https://github.com/scinscinscin/slex) lexer.**

```ts
import { Slex } from "@scinorandex/slex";

// Make sure the identifiers here match with the terminals in your CFG.
enum TokenType {
  PLUS, MINUS, STAR, SLASH, NUMBER, EOF
}

type Metadata = {};

const lexerGenerator = new Slex<TokenType, Metadata>({
  EOF_TYPE: TokenType.EOF,
  isHigherPrecedence: ({ current, next }) => false,
});

lexerGenerator.addRule("plus", "$+", TokenType.PLUS);
lexerGenerator.addRule("minus", "$-", TokenType.MINUS);
lexerGenerator.addRule("star", "$*", TokenType.STAR);
lexerGenerator.addRule("forward_slash", "$/", TokenType.SLASH);
lexerGenerator.addRule("digit", "0|1|2|3|4|5|6|7|8|9");
lexerGenerator.addRule("float_number", "(${digit})+$.(${digit})+");
lexerGenerator.addRule("decimal_number", "(${digit})+");
lexerGenerator.addRule("number_literal", "${float_number}|${decimal_number}", TokenType.NUMBER);

const lexer = lexerGenerator.generate(`2.4 + 3.5 * 1 / 456.789`, () => ({}));
```

3. **Define the node representation.**

Sparse allows you to build the AST however you want, deferring to your functions when its time to make a reduction, giving you control over the representation.

```ts
type StringifiedNode = (StringifiedNode | string)[];

// It doesn't have to be a class. It just has to be a structure that all nodes
// in the AST adhere to. Classes allow this to be done easily through subclassing.
class Node {
  constructor(public readonly nodes: LR1StackSymbol<TokenType, Metadata, Node>[]) {}
  toObject(): StringifiedNode {
    return this.nodes.map((node) => (node.type === "token" 
      ? node.token.lexeme 
      : node.node.toObject()
    ));
  }
}
```

4. **Building the parser.**

With a prebuilt parsing table, `Sparse.fromGrammarFile` reads the grammar, reads the table, and checks that the two belong together:

```ts
import { Sparse, enumToString } from "@scinorandex/sparse";

async function main() {
  const parserGenerator = await Sparse.fromGrammarFile<TokenType, Metadata, Node>({
    grammarPath: "./example/math/grammar.txt",
    tablePath: "./example/math/table.txt",
    toStringifiedTokenType: enumToString<TokenType>(TokenType),
    onWarning: ({ reason, token }) => console.warn(`${token.line}:${token.column} ${reason}`),
  });

  const parser = parserGenerator.generate(lexer, {
    reducer: (_, { input }) => new Node(input),
  });

  console.log(parser.parse().result!.toObject());
}
```

Generating the table at startup instead (fine for small grammars, slow for big ones):

```ts
import { buildProductions, Sparse, enumToString } from "@scinorandex/sparse";

async function main() {
  const productions = buildProductions(await fs.readFile("./example/math/grammar.txt", "utf8"));
  const parserGenerator = Sparse.fromProductions<TokenType, Metadata, Node>({
    productions,
    toStringifiedTokenType: enumToString<TokenType>(TokenType),
  });
}
```

## Grammar syntax reference

A grammar file is a list of productions. Whitespace is insignificant, `//` starts a line comment, and `/* ... */` spans lines.

| Syntax | Meaning |
| --- | --- |
| `<A>: <B> [C];` | `A` is made of one `B` followed by one `C` |
| `<A: name>: ...;` | The production is *named*: its reducer is looked up under `name` |
| `[TOK: name]` | Names the terminal on the right hand side so it shows up on the reducer's `bag` |
| `<VAR: name>` | Same, for a variable |
| `[A | B]` | Alternatives: unrolled into one production per alternative |
| `<A | B>` | Same, for variables |
| `([A] [B])?` | Optional group, unrolled into one production with and one without it |
| `// comment`, `/* comment */` | Comments |

Identifiers may contain letters, digits, `_` and `-`, and must start with a letter or `_`.

### What Sparse checks for you

Grammar and table problems are reported as a `Result` failure with the offending token, so the CLI and
`loadGrammar` can print a window into your file:

- a variable used on the right hand side that no production defines
- an empty right hand side (a production like `<A: a>: ([X])?;` expands to nothing, and Sparse has no support for empty productions)
- the start symbol appearing on the right hand side
- two symbols in one production sharing a name (warns: only the last one reaches the `bag`)
- a production that is never reachable from the start symbol (warns)

```
$ npx sparse --input=broken.txt --output=table.txt
Invalid syntax at 2:30: got SEMICOLON (";"), but expected one of [L_ANGLE], [L_BRACKET], [L_PAREN]

2 | <PROGRAM: program>: [NUMBER] (;
  |                               ~
3 |
```

## Reducers

Reducers are keyed by the name in the grammar, and receive two arguments:

```ts
type Reducer<TokenType, Metadata, Node> = (
  newInput: { bag: Record<string, Node | Token<TokenType, Metadata>>; name: string | null },
  oldInput: { input: LR1StackSymbol<TokenType, Metadata, Node>[]; index: number },
) => Node;
```

- `newInput.name` is the production's name, or `null` for an unnamed production.
- `newInput.bag` holds the right hand side symbols that were named in the grammar, keyed by those names. If two symbols share a name, the last one wins, so reach for `oldInput.input` when that happens.
- `oldInput.input` is the reduced symbols in order, as `{ type: "token", token }` or `{ type: "node", node }`.
- `oldInput.index` is the production's index *in the grammar file*, before `*`/`?`/`+`/`|` unrolling. Index 0 is the accept production, whose reducer is never called.

`defineReducers` turns a map of reducers into the reducer that `generate` wants, and tells you exactly which production has no reducer:

```ts
import { assertReducersCoverGrammar, defineReducers } from "@scinorandex/sparse";

const reducers = {
  program: ({ bag }) => new Node(bag),
  expression: ({ bag }, { input }) => new Node(input),
};

assertReducersCoverGrammar(productions, reducers); // throws if something is missing

const parser = parserGenerator.generate(lexer, {
  reducer: defineReducers(reducers),
});
```

Without the helper the failure looks like this, halfway through a parse:

```
Error while performing the reduction for production 2 ("expression"): I cannot reduce a null bag
```

## Repetition with `*` and `+`

`[A]?`, `A B*`, and `A B+` are unrolled into extra productions. For `*` and `+` that means a new
production named **`autogenerated-kleene`** (with variables called `autogen-0`, `autogen-1`, ...), which
you **have** to implement: it is handed the items matched so far, and it has to flatten them into a list.
The first reduction has no `rest`, later ones do:

```ts
class KleeneNode<T> extends Node {
  contents: T[] = [];

  constructor(nodes: LR1StackSymbol<TokenType, Metadata, Node>[], bag: T) {
    super(nodes);
    this.contents.unshift(bag);
  }

  add(nodes: LR1StackSymbol<TokenType, Metadata, Node>[], bag: T) {
    this.nodes.unshift(...nodes.slice(0, nodes.length - 1));
    this.contents.unshift(bag);
    return this;
  }
}

const reducers = {
  "autogenerated-kleene": ({ bag: { rest, ...item } }, { input }) =>
    rest == null ? new KleeneNode(input, item) : rest.add(input, item),
  program: (_, { input }) => new Node(input),
};
```

See `example/kleene-test` for the whole thing.

## Error recovery

By default a syntax error throws `LR1ParserGraveError`, which carries the token that could not be parsed:

```ts
try {
  parser.parse();
} catch (err) {
  if (err instanceof LR1ParserGraveError) console.error(err.reason, err.currentToken);
}
```

Pass a `recover` function to decide what happens instead. It receives the lexer, both stacks, the table,
and these helpers:

| Helper | What it does |
| --- | --- |
| `addError(reason)` | Records an error, keeps parsing, and returns it in `parse().errors` |
| `crash(reason)` | Stops parsing and throws a `LR1ParserGraveError` |
| `finish(options?)` | Stops recovery and carries on parsing from the current state |
| `insertToken(token)` | Shifts a token the input did not have, e.g. a synthesized `;` |
| `isSafe()` | True when the current state can consume the next real token |

```ts
const parser = parserGenerator.generate(lexer, {
  reducer: (_, { input }) => new Node(input),
  recover({ lexer, states, statesStack, insertToken, addError, isSafe, finish, crash }) {
    const token = lexer.peekNextToken();

    // skip the extra semicolons the author left behind
    while (token.type === TokenType.SEMICOLON) {
      lexer.getNextToken();
      if (isSafe()) return finish();
    }

    // or insert the semicolon they forgot
    if (states[statesStack.peek()].getTerminalAction("SEMICOLON") != null) {
      const semicolon = new Token(TokenType.SEMICOLON, ";", new ColumnAndRow(token.line, token.column), {});
      const inserted = insertToken(semicolon);
      if (inserted != null) return crash(inserted.reason);
      addError(`Expected SEMICOLON but received ${TokenType[token.type]}`);
      if (isSafe()) return finish();
    }

    return crash("Invalid syntax");
  },
});

const { result, errors } = parser.parse();
```

A parser consumes its lexer, so build a new one per input with `generate(...)`, or call `parser.reset()`
if you want to reuse the parser with a lexer that still has tokens left.

## Generating and shipping the parsing table

Generating states for a large grammar takes a while (a few seconds for a few hundred productions), so
generate the table once at build time and commit it:

```
npx sparse --input=grammar.txt --output=table.txt
```

| Flag | Meaning |
| --- | --- |
| `--input=<file>` | Grammar to read (required) |
| `--output=<file>` | Table to write; missing directories are created |
| `--lalr` | Generate LALR(1) states instead of LR(1) |
| `--check` | Write nothing; verify that `<output>` already matches the grammar |
| `--stdout` | Print the table instead of writing it |
| `--quiet` | Hide warnings about suspicious rules |
| `--help` | Usage |

By default, LR(1) states are generated. You can generate LALR(1) states instead by passing the `--lalr`
flag (or setting `mode: "lalr1"` in `Sparse.fromProductions`): the resulting table is never larger than
the LR(1) one. Using LALR(1) yields a ~35% performance boost over LR(1) for the same grammar (tested on
the LoLang example).

`--check` is useful in CI to prove that a committed table still matches its grammar:

```
npx sparse --input=example/math/grammar.txt --output=example/math/table.txt --check
```

Then load the table with `Sparse.fromGrammarFile`, as shown in [Getting started](#getting-started).

## API reference

### Reading and writing grammars

| Function | Returns |
| --- | --- |
| `buildProductions(source)` / `tryBuildProductions(source)` | The unrolled productions. Throws / returns a `Result` failure with the offending token |
| `loadGrammar(path)` | Same, but reads the file, turning missing files into failures too |
| `buildStates(table)` / `tryBuildStates(table)` | `TableState[]` from a table file, validating action syntax and state numbers |
| `loadTable(path)` | Same, but reads the file |
| `generateStates(productions, options?)` | `GeneratorResult`; `options` is `{ mode, onWarning, onProgress }` |
| `validateProductions(productions, options?)` | Fails on a grammar that cannot generate a correct table |
| `validateTable(productions, states)` | Fails when a table does not belong to the productions |
| `validateTableStates(states, options?)` | Fails on a malformed table |

### Building parsers

| Function | Returns |
| --- | --- |
| `Sparse.fromGrammarFile({ grammarPath, tablePath, toStringifiedTokenType, onWarning?, validate? })` | Loads a grammar and its prebuilt table, cross-checking them |
| `Sparse.fromProductions({ productions, toStringifiedTokenType, mode?, quiet? })` | Generates states at startup |
| `Sparse.tryFromProductions(...)` | Same, as a `Result` |
| `new Sparse({ productions, states, toStringifiedTokenType, validate?, source? })` | Use when you already hold the states |
| `generator.generate(lexer, { reducer, recover? })` | A parser |
| `parser.parse()` | `{ result, errors }` |
| `parser.reset()` | Clears the stacks and errors |

### Helpers

| Export | Purpose |
| --- | --- |
| `enumToString(TokenType)` | The `toStringifiedTokenType` every example used to write by hand |
| `defineReducers(reducers)` | Turns a map of named reducers into a reducer |
| `assertReducersCoverGrammar(productions, reducers)` | Fails up front when a named production has no reducer |
| `missingReducerNames(productions, reducers)` / `missingReducerMessage(...)` | Same, as data |
| `namedProductions(productions)` | Every production the grammar names |
| `TableState.fromJSObject(json)` / `GeneratorResult.toJSObject()` | Round trip a table through JSON |
| `hydrateProduction(json)` / `dehydateProduction(production)` | Round trip productions through JSON |
| `buildErrorWindow(source, token)` | Renders the window around a token |
| `Stack` | `push`, `pop`, `peek`, `peekAt`, `size`, `isEmpty`, `toArray` |

## Known limitations

- `?`, `*` and `+` only apply to a parenthesized group, and a group that can match nothing
  (`<A: a>: ([X])?;`) is rejected because Sparse has no support for empty productions. Write two
  productions instead.
- Sparse does not detect grammar conflicts (shift/reduce, reduce/reduce). An ambiguous grammar produces a
  table with one arbitrary resolution, so if your parser behaves strangely, check your grammar for ambiguity.
- A state with no actions cannot be written in the table file format; `toTable()` throws for such grammars.
  Use `Sparse.fromProductions` to keep the states in memory instead.

## AI Disclaimer

This project was originally written without the use of AI tools, the core LR(1) table generator was written by hand as per the algorithms described in the Dragon Book. Every release prior to v0.1 contained no AI generated code.

OpenCode and Qwen 3.8 27B were to implement performance improvements on the original LR(1) table generator and to implement LALR(1) support.