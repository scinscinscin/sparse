import { Slex, Token } from "@scinorandex/slex";
import { generateStates } from "./generator";
import { Production } from "./grammarParser";
import { Stack } from "./utils/Stack";
import { Result } from "./utils/Result";

export type TableAction = { type: "shift" | "reduce" | "goto"; value: number };

export class TableState {
  public readonly actions: Map<string, TableAction>;

  constructor() {
    this.actions = new Map();
  }

  public getTerminalAction(terminal: string): TableAction | undefined {
    return this.actions.get(`[${terminal}]`);
  }

  public getVariableAction(variable: string): TableAction | undefined {
    return this.actions.get(variable);
  }
}

export type LR1StackSymbol<TokenType, Metadata, Node> =
  | { type: "token"; token: Token<TokenType, Metadata> }
  | { type: "node"; node: Node };

export class Sparse<TokenType, Metadata, Node> {
  public constructor(
    public readonly options: {
      productions: Production[];
      states: TableState[];
      toStringifiedTokenType: (tokenType: TokenType) => string;
    }
  ) {}

  public static tryFromProductions<TokenType, Metadata, Node>(options: {
    productions: Production[];
    toStringifiedTokenType: (tokenType: TokenType) => string;
  }): Result<Sparse<TokenType, Metadata, Node>> {
    const statesResult = generateStates(options.productions);
    if (statesResult.success === false) return statesResult;
    const states = statesResult.value;

    const sparse = new Sparse<TokenType, Metadata, Node>({
      productions: options.productions,
      states: states.toStates(),
      toStringifiedTokenType: options.toStringifiedTokenType,
    });

    return { success: true, value: sparse };
  }

  public static fromProductions<TokenType, Metadata, Node>(options: {
    productions: Production[];
    toStringifiedTokenType: (tokenType: TokenType) => string;
  }) {
    const result = Sparse.tryFromProductions<TokenType, Metadata, Node>(options);
    if (result.success === false)
      throw new Error(`Encountered error "${result.reason}" at ${result.token.line}:${result.token.column}`);
    return result.value;
  }

  public generate(
    lexer: ReturnType<Slex<TokenType, Metadata>["generate"]>,
    options: {
      reducer: (input: LR1StackSymbol<TokenType, Metadata, Node>[], productionIndex: number) => Node;
      recover?: ParserRecoveryFunction<TokenType, Metadata, Node>;
    }
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
  states: TableState[];
}) => { success: true; token?: Token<TokenType, Metadata> } | { success: false; reason: string };

export type ParserError<TokenType, Metadata> = { token: Token<TokenType, Metadata>; message: string };
export type ParserResult<TokenType, Metadata, Node> = {
  result: Node | null;
  errors: ParserError<TokenType, Metadata>[];
};

class LR1Parser<TokenType, Metadata, Node> {
  statesStack: Stack<number> = new Stack([0]);
  symbolsStack: Stack<LR1StackSymbol<TokenType, Metadata, Node>> = new Stack();
  exceptions: ParserError<TokenType, Metadata>[] = [];

  public constructor(
    public readonly options: {
      productions: Production[];
      states: TableState[];
      toStringifiedTokenType: (tokenType: TokenType) => string;
    },
    public readonly reducer: (input: LR1StackSymbol<TokenType, Metadata, Node>[], productionIndex: number) => Node,
    public readonly recover: ParserRecoveryFunction<TokenType, Metadata, Node> | null,
    public readonly lexer: ReturnType<Slex<TokenType, Metadata>["generate"]>
  ) {}

  public parse(): ParserResult<TokenType, Metadata, Node> {
    const { productions, states, toStringifiedTokenType } = this.options;

    while (true) {
      let currentState = this.statesStack.peek();
      let token = this.lexer.peekNextToken();
      let action = states[currentState].getTerminalAction(toStringifiedTokenType(token.type));

      if (action == null) {
        if (this.recover === null)
          throw new LR1ParserGraveError(
            `Invalid syntax. Expected ${[...states[currentState].actions.keys()].join(
              ","
            )} but got ${toStringifiedTokenType(token.type)}`,
            token
          );

        const recoveryResult = this.recover({
          lexer: this.lexer,
          states,
          statesStack: this.statesStack,
          symbolsStack: this.symbolsStack,
          addError: (reason: string) => this.exceptions.push({ message: reason, token: this.lexer.peekNextToken() }),
          crash: (reason: string) => ({ success: false, reason }),
          finish: (options?: { newToken: Token<TokenType, Metadata> }) => ({ success: true, token: options?.newToken }),
          isSafe: () =>
            states[this.statesStack.peek()].actions.has(`[${toStringifiedTokenType(this.lexer.peekNextToken().type)}]`),
        });

        if (recoveryResult.success === false) throw new LR1ParserGraveError(recoveryResult.reason, token);

        token = recoveryResult.token ?? this.lexer.peekNextToken();
        currentState = this.statesStack.peek();
        action = states[currentState].getTerminalAction(toStringifiedTokenType(token.type));
      }

      const fixedAction = action as TableAction;
      if (fixedAction.type === "shift") {
        // add current token to the stack and push the next state
        token = this.lexer.getNextToken();
        this.statesStack.push(fixedAction.value);
        this.symbolsStack.push({ type: "token", token: token });
      }

      // handle reductions
      else if (fixedAction.type === "reduce") {
        if (fixedAction.value === 0) break;
        const production = productions[fixedAction.value];

        // pop the stack and reduce by this production
        const popped: LR1StackSymbol<TokenType, Metadata, Node>[] = [];
        for (let i = 0; i < production.rhs.length; i++) {
          popped.unshift(this.symbolsStack.pop());
          this.statesStack.pop();
        }

        // try to perform the reduction
        try {
          this.symbolsStack.push({ type: "node", node: this.reducer(popped, fixedAction.value) });
        } catch (err) {
          const input = JSON.stringify(popped, null, 2);
          throw new LR1ParserGraveError(
            `Error while performing reduction for production: ${fixedAction.value}. Reduction input: ${input}`,
            token
          );
        }

        // get the top node and figure out what state to add to state stack
        const topNode = this.statesStack.peek();
        const gotoAction = states[topNode].getVariableAction(production.lhs.lexeme);

        if (gotoAction == undefined)
          throw new LR1ParserGraveError(
            `No GOTO action for for state: ${topNode} and production: ${production.lhs}. Actions: Reduce by production ${fixedAction.value}`,
            token
          );
        else if (gotoAction.type !== "goto")
          throw new LR1ParserGraveError(
            `Expected GOTO action for state: ${topNode} and production: ${production.lhs}. Actions: Reduce by production ${fixedAction.value}. Received: ${gotoAction.type}`,
            token
          );

        this.statesStack.push(gotoAction.value);
      }
    }

    const top = this.symbolsStack.peek();
    return { result: top.type === "node" ? top.node : null, errors: this.exceptions };
  }
}

export class LR1ParserGraveError<TokenType, Metadata> extends Error {
  constructor(public readonly reason: string, public readonly currentToken: Token<TokenType, Metadata>, err?: Error) {
    super(reason);
  }
}
