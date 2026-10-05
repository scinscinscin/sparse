import { Slex, Token } from "@scinorandex/slex";
import { generateStates } from "./generator";
import { Stack } from "./utils/Stack";
import { Result } from "./utils/Result";
import { GrammarToken, Production, ProductionWarning } from "./meta/common";
import { loadGrammar, loadTable } from "./utils/loadFiles";
import { validateTable } from "./table/validate";

export type TableAction = { type: "shift" | "reduce" | "goto"; value: number };

export class TableState {
  public readonly actions: Map<string, TableAction>;

  /**
   * The actions exactly as they were written in a table file (`"s12"`, `"r3"`, `"7"`), kept so that
   * malformed entries can be reported with the text the user actually typed.
   */
  public readonly rawActions: Map<string, string>;

  constructor(actions = new Map<string, TableAction>(), rawActions = new Map<string, string>()) {
    this.actions = actions;
    this.rawActions = rawActions;
  }

  public getTerminalAction(terminal: string): TableAction | undefined {
    return this.actions.get(`[${terminal}]`);
  }

  public getVariableAction(variable: string): TableAction | undefined {
    return this.actions.get(variable);
  }

  /** Every terminal this state can consume, without the surrounding brackets, sorted. */
  public getTerminalKeys(): string[] {
    return this.getKeys("[", "]");
  }

  /** Every variable this state can reduce past, without the surrounding angle brackets, sorted. */
  public getVariableKeys(): string[] {
    return this.getKeys("<", ">");
  }

  private getKeys(prefix: string, suffix: string): string[] {
    const keys: string[] = [];
    for (const key of this.actions.keys())
      if (key.startsWith(prefix) && key.endsWith(suffix))
        keys.push(key.substring(prefix.length, key.length - suffix.length));
    return keys.sort();
  }

  toJSObject() {
    return Object.fromEntries(this.actions);
  }

  static fromJSObject(json: ReturnType<TableState["toJSObject"]>) {
    const actions = new Map(Object.entries(json));
    const rawActions = new Map(
      [...actions].map(([key, action]) => [
        key,
        action.type === "goto" ? `${action.value}` : `${action.type === "shift" ? "s" : "r"}${action.value}`,
      ]),
    );
    return new TableState(actions, rawActions);
  }
}

export type ReducerType<TokenType, Metadata, Node> = (
  newInput: { bag: any; name: string | null },
  oldInput: { input: LR1StackSymbol<TokenType, Metadata, Node>[]; index: number },
) => Node;

export type LR1StackSymbol<TokenType, Metadata, Node> =
  | { type: "token"; token: Token<TokenType, Metadata> }
  | { type: "node"; node: Node };

export type SparseOptions<TokenType> = {
  productions: Production[];
  states: TableState[];
  toStringifiedTokenType: (tokenType: TokenType) => string;
  /**
   * Cross-check the productions against the parsing table right away, so a stale table is reported
   * here instead of as an opaque crash in the middle of a parse. Off by default.
   */
  validate?: boolean;
  /** Name of the grammar file, used to make validation errors actionable. */
  source?: string;
};

export type FromProductionsOptions<TokenType> = {
  productions: Production[];
  toStringifiedTokenType: (tokenType: TokenType) => string;
  mode?: "lr1" | "lalr1";
  /** Generating states can take a while for big grammars; set to true to silence the timing log. */
  onWarning?: (warning: ProductionWarning) => void;
  onProgress?: (statesGenerated: number) => void;
};

export class Sparse<TokenType, Metadata, Node> {
  public constructor(public readonly options: SparseOptions<TokenType>) {
    if (options.validate === true) {
      const result = validateTable(options.productions, options.states, { source: options.source });
      if (result.success === false) throw new Error(`The parsing table does not match the grammar: ${result.reason}`);
    }
  }

  public static tryFromProductions<TokenType, Metadata, Node>(
    options: FromProductionsOptions<TokenType>,
  ): Result<Sparse<TokenType, Metadata, Node>> {
    const startedAt = Date.now();

    const statesResult = generateStates(options.productions, {
      mode: options.mode,
      onWarning: options.onWarning,
      onProgress: options.onProgress,
    });
    if (statesResult.success === false) return statesResult;
    const states = statesResult.value;

    const sparse = new Sparse<TokenType, Metadata, Node>({
      productions: options.productions,
      states: states.toStates(),
      toStringifiedTokenType: options.toStringifiedTokenType,
    });

    return { success: true, value: sparse };
  }

  public static fromProductions<TokenType, Metadata, Node>(options: FromProductionsOptions<TokenType>) {
    const result = Sparse.tryFromProductions<TokenType, Metadata, Node>(options);
    if (result.success === false) throw new SparseGrammarError(result.reason, result.token);
    return result.value;
  }

  /** Builds a parser generator from a grammar file and a prebuilt parsing table file. */
  public static async tryFromGrammarFile<TokenType, Metadata, Node>(options: {
    grammarPath: string;
    tablePath: string;
    toStringifiedTokenType: (tokenType: TokenType) => string;
    onWarning?: (warning: ProductionWarning) => void;
    /** Set to false to skip cross-checking the table against the grammar. */
    validate?: boolean;
  }): Promise<Result<Sparse<TokenType, Metadata, Node>>> {
    const productionsResult = await loadGrammar(options.grammarPath, { onWarning: options.onWarning });
    if (productionsResult.success === false) return productionsResult;

    const statesResult = await loadTable(options.tablePath, { productions: productionsResult.value });
    if (statesResult.success === false) return statesResult;

    if (options.validate !== false) {
      const tableResult = validateTable(productionsResult.value, statesResult.value, {
        source: options.tablePath,
      });
      if (tableResult.success === false) return tableResult;
    }

    return {
      success: true,
      value: new Sparse<TokenType, Metadata, Node>({
        productions: productionsResult.value,
        states: statesResult.value,
        toStringifiedTokenType: options.toStringifiedTokenType,
        source: options.grammarPath,
      }),
    };
  }

  public static async fromGrammarFile<TokenType, Metadata, Node>(options: {
    grammarPath: string;
    tablePath: string;
    toStringifiedTokenType: (tokenType: TokenType) => string;
    onWarning?: (warning: ProductionWarning) => void;
    validate?: boolean;
  }): Promise<Sparse<TokenType, Metadata, Node>> {
    const result = await Sparse.tryFromGrammarFile<TokenType, Metadata, Node>(options);
    if (result.success === false) throw new SparseGrammarError(result.reason, result.token);
    return result.value;
  }

  public generate(
    lexer: ReturnType<Slex<TokenType, Metadata>["generate"]>,
    options: {
      reducer: ReducerType<TokenType, Metadata, Node>;
      recover?: ParserRecoveryFunction<TokenType, Metadata, Node>;
    },
  ) {
    return new LR1Parser<TokenType, Metadata, Node>(this.options, options.reducer, options.recover ?? null, lexer);
  }
}

export type ParserRecoveryFunction<TokenType, Metadata, Node> = (options: {
  lexer: ReturnType<Slex<TokenType, Metadata>["generate"]>;
  statesStack: Stack<number>;
  symbolsStack: Stack<LR1StackSymbol<TokenType, Metadata, Node>>;
  isSafe: () => boolean;
  addError: (reason: string) => void;
  crash: (reason: string) => { success: false; reason: string };
  finish: (options?: { newToken: Token<TokenType, Metadata> }) => {
    success: true;
    token?: Token<TokenType, Metadata>;
  };
  /**
   * Pushes a token that the input did not contain (a synthesized semicolon, a closing brace, ...)
   * onto both stacks, exactly as if the lexer had produced it. Unlike `finish({ newToken })`, which
   * only hands the token back to the parser as a lookahead, this one actually shifts it.
   */
  insertToken: (token: Token<TokenType, Metadata>) => { success: false; reason: string } | undefined;
  states: TableState[];
}) => { success: true; token?: Token<TokenType, Metadata> } | { success: false; reason: string };

export type ParserError<TokenType, Metadata> = { token: Token<TokenType, Metadata>; message: string };
export type ParserResult<TokenType, Metadata, Node> = {
  result: Node | null;
  errors: ParserError<TokenType, Metadata>[];
};

export class LR1Parser<TokenType, Metadata, Node> {
  statesStack: Stack<number> = new Stack([0]);
  symbolsStack: Stack<LR1StackSymbol<TokenType, Metadata, Node>> = new Stack();
  exceptions: ParserError<TokenType, Metadata>[] = [];

  public constructor(
    public readonly options: SparseOptions<TokenType>,
    public readonly reducer: ReducerType<TokenType, Metadata, Node>,
    public readonly recover: ParserRecoveryFunction<TokenType, Metadata, Node> | null,
    public readonly lexer: ReturnType<Slex<TokenType, Metadata>["generate"]>,
  ) {}

  /**
   * Clears the stacks and the collected errors so the parser can be handed to a fresh lexer.
   * A parser instance consumes its lexer, so the usual way to parse a second input is to call
   * `generator.generate(newLexer, options)` again.
   */
  public reset() {
    this.statesStack = new Stack([0]);
    this.symbolsStack = new Stack();
    this.exceptions = [];
  }

  public parse(): ParserResult<TokenType, Metadata, Node> {
    const { productions, states, toStringifiedTokenType } = this.options;

    if (states.length === 0)
      throw new LR1ParserGraveError("The parsing table is empty, so no token can be parsed", null as any);

    const currentStates = () => {
      const state = states[this.statesStack.peek()];
      if (state == null)
        throw new LR1ParserGraveError(
          `The parsing table is out of sync with the grammar: state ${this.statesStack.peek()} does not exist (the table has ${states.length} states)`,
          null as any,
        );
      return state;
    };

    while (true) {
      let currentState = currentStates();
      let token = this.lexer.peekNextToken();
      let action = currentState.getTerminalAction(toStringifiedTokenType(token.type));

      if (action == null) {
        if (this.recover === null) throw new LR1ParserGraveError(this.syntaxErrorMessage(currentState, token), token);

        const recoveryResult = this.recover({
          lexer: this.lexer,
          states,
          statesStack: this.statesStack,
          symbolsStack: this.symbolsStack,
          addError: (reason: string) => this.exceptions.push({ message: reason, token: this.lexer.peekNextToken() }),
          crash: (reason: string) => ({ success: false, reason }),
          finish: (options?: { newToken: Token<TokenType, Metadata> }) => ({ success: true, token: options?.newToken }),
          insertToken: (newToken: Token<TokenType, Metadata>) => this.insertToken(newToken),
          isSafe: () => currentStates().actions.has(`[${toStringifiedTokenType(this.lexer.peekNextToken().type)}]`),
        });

        if (recoveryResult.success === false) throw new LR1ParserGraveError(recoveryResult.reason, token);

        token = recoveryResult.token ?? this.lexer.peekNextToken();
        currentState = currentStates();
        action = currentState.getTerminalAction(toStringifiedTokenType(token.type));

        if (action == null) throw new LR1ParserGraveError(this.syntaxErrorMessage(currentState, token), token);
      }

      const fixedAction = action as TableAction;
      if (fixedAction.type === "shift") {
        // add current token to the stack and push the next state
        token = this.lexer.getNextToken();
        this.pushState(fixedAction.value);
        this.symbolsStack.push({ type: "token", token: token });
      }

      // handle reductions
      else if (fixedAction.type === "reduce") {
        if (fixedAction.value === 0) break;
        const production = productions[fixedAction.value];

        if (production == null)
          throw new LR1ParserGraveError(
            `The parsing table is out of sync with the grammar: it reduces by production ${fixedAction.value}, but the grammar only has ${productions.length} productions`,
            token,
          );

        // pop the stack and reduce by this production
        const popped: LR1StackSymbol<TokenType, Metadata, Node>[] = [];
        for (let i = 0; i < production.rhs.length; i++) {
          popped.unshift(this.symbolsStack.pop());
          this.statesStack.pop();
        }

        // try to perform the reduction
        const productionIndex = production.originalProductionIndex;

        try {
          // prepare the object that you're going to send to the reducer function
          const bag = {} as { [key: string]: Node | Token<TokenType, Metadata> };

          for (let i = 0; i < production.rhs.length; i++) {
            const rhsItem = production.rhs[i];
            const poppedItem = popped[i];
            if (rhsItem.name != null)
              bag[rhsItem.name] = poppedItem.type === "token" ? poppedItem.token : poppedItem.node;
          }

          const newInput = { bag, name: production.name };
          const oldInput = { input: popped, index: productionIndex };

          const node = this.reducer(newInput, oldInput);
          this.symbolsStack.push({ type: "node", node });
        } catch (err) {
          const cause = err instanceof Error ? err.message : String(err);
          const input = truncate(JSON.stringify(popped), 500);
          throw new LR1ParserGraveError(
            `Error while performing the reduction for production ${productionIndex}${describeProduction(production)}: ${cause}\nReduction input: ${input}`,
            token,
            err instanceof Error ? err : undefined,
          );
        }

        // get the top node and figure out what state to add to state stack
        const topNode = this.statesStack.peek();
        const gotoAction = currentStates().getVariableAction(production.identifier);

        if (gotoAction == undefined)
          throw new LR1ParserGraveError(
            `No GOTO action for for state: ${topNode} and production: ${production.identifier}. Actions: Reduce by production ${productionIndex}`,
            token,
          );
        else if (gotoAction.type !== "goto")
          throw new LR1ParserGraveError(
            `Expected GOTO action for state: ${topNode} and production: ${production.identifier}. Actions: Reduce by production ${productionIndex}. Received: ${gotoAction.type}`,
            token,
          );

        this.pushState(gotoAction.value);
      }
    }

    // A table can accept the empty input by reducing to production 0 straight away, in which case
    // nothing was ever shifted and there is no tree to hand back.
    if (this.symbolsStack.isEmpty) return { result: null, errors: this.exceptions };

    const top = this.symbolsStack.peek();
    return { result: top.type === "node" ? top.node : null, errors: this.exceptions };
  }

  private pushState(state: number) {
    if (state === undefined || this.options.states[state] == null)
      throw new LR1ParserGraveError(
        `The parsing table is out of sync with the grammar: it points at state ${state}, but the table only has ${this.options.states.length} states`,
        null as any,
      );
    this.statesStack.push(state);
  }

  /** Shifts a token that was not in the input, used by error recovery. */
  private insertToken(token: Token<TokenType, Metadata>): { success: false; reason: string } | undefined {
    const state = this.options.states[this.statesStack.peek()];
    const action = state?.getTerminalAction(this.options.toStringifiedTokenType(token.type));

    if (action == null)
      return {
        success: false,
        reason: `Cannot insert ${this.options.toStringifiedTokenType(token.type)} here: state ${this.statesStack.peek()} does not accept it. Expected ${state?.getTerminalKeys().join(", ") ?? "nothing"}`,
      };

    if (action.type !== "shift")
      return {
        success: false,
        reason: `Cannot insert ${this.options.toStringifiedTokenType(
          token.type,
        )} here: state ${this.statesStack.peek()} reduces on it instead of shifting it`,
      };

    this.pushState(action.value);
    this.symbolsStack.push({ type: "token", token });
    return undefined;
  }

  private syntaxErrorMessage(state: TableState, token: Token<TokenType, Metadata>) {
    const expected = state.getTerminalKeys();
    const got = this.options.toStringifiedTokenType(token.type);
    const lexeme = token.lexeme === "" ? "" : ` ("${token.lexeme}")`;
    return `Invalid syntax at ${token.line}:${token.column}: got ${got}${lexeme}, but expected ${
      expected.length === 0 ? "the end of the input" : `one of [${expected.join("], [")}]`
    }`;
  }
}

export class LR1ParserGraveError<TokenType, Metadata> extends Error {
  constructor(
    public readonly reason: string,
    public readonly currentToken: Token<TokenType, Metadata> | null,
    err?: Error,
  ) {
    super(reason, err === undefined ? undefined : { cause: err });
    this.name = "LR1ParserGraveError";
  }
}

/** A grammar (or table) problem found before parsing started, always tied to a place in the file. */
export class SparseGrammarError extends Error {
  constructor(
    public readonly reason: string,
    public readonly token: GrammarToken,
  ) {
    super(`Encountered error "${reason}" at ${token.line}:${token.column}`);
    this.name = "SparseGrammarError";
  }
}

const truncate = (value: string, max: number) =>
  value.length <= max ? value : `${value.slice(0, max)}... (${value.length} characters)`;

const describeProduction = (production: Production) =>
  production.name == null ? ` (${production.identifier})` : ` ("${production.name}")`;
