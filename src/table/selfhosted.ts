import { GrammarToken, Production, describeThrowable, syntheticGrammarToken } from "../meta/common";
import { BaseNode, getSelfHostedParserGenerator, grammarLexerGenerator, ListNode } from "../meta/selfhosted";
import { LR1ParserGraveError, TableAction, TableState } from "../parser";
import { selfhosted } from "./states";
import { Result } from "../utils/Result";
import { TableFormatWarning, validateTableStates } from "./validate";

class StateNode extends BaseNode {
  constructor(public readonly items: ListNode<ItemNode>) {
    super();
  }

  toTableState(): TableState {
    const state = new TableState();
    // The item list is built right-recursively (rest.add(item)), so it comes out reversed.
    for (const item of this.items.getItemsReversed()) {
      const key = item.type === "terminal" ? `[${item.name.lexeme}]` : `<${item.name.lexeme}>`;
      state.actions.set(key, item.action);
      state.rawActions.set(key, item.rawAction);
    }
    return state;
  }
}

class ItemNode extends BaseNode {
  constructor(
    public readonly type: "terminal" | "variable",
    public readonly name: GrammarToken,
    public readonly action: TableAction,
    public readonly rawAction: string,
  ) {
    super();
  }
}

type Reducer = (bag: any) => BaseNode;
const reducers: { [key: string]: Reducer } = {
  program: (bag: { states: ListNode<StateNode> }) => bag.states,
  states: (bag: { state: ListNode<ItemNode>; rest?: ListNode<StateNode> }) => {
    if (bag.rest == null) return new ListNode<StateNode>([new StateNode(bag.state)]);
    else return bag.rest.add(new StateNode(bag.state));
  },

  items: (bag: { item: ItemNode; rest?: ListNode<ItemNode> }) => {
    if (bag.rest == null) return new ListNode<ItemNode>([bag.item]);
    else return bag.rest.add(bag.item);
  },

  terminal: (bag: { name: GrammarToken; action: GrammarToken }) => {
    const action: TableAction = {
      type: bag.action.lexeme.startsWith("s") ? "shift" : "reduce",
      value: parseInt(bag.action.lexeme.substring(1)),
    };
    return new ItemNode("terminal", bag.name, action, bag.action.lexeme);
  },

  variable: (bag: { name: GrammarToken; state: GrammarToken }) => {
    const action: TableAction = { type: "goto", value: parseInt(bag.state.lexeme) };
    return new ItemNode("variable", bag.name, action, bag.state.lexeme);
  },
};

export type BuildStatesOptions = {
  /** Pass the grammar's productions to also check every "reduce" action against them. */
  productions?: Production[];
  /** Name of the file the table was read from, used to make error messages actionable. */
  source?: string;
  onWarning?: (warning: TableFormatWarning) => void;
};

/**
 * Reads a parsing table written by the CLI (`sparse --input=grammar.txt --output=table.txt`).
 * Returns a `Result` instead of throwing so that table problems can be reported alongside the
 * offending grammar line.
 */
export const tryBuildStates = (table: string, options: BuildStatesOptions = {}): Result<TableState[]> => {
  const lexer = grammarLexerGenerator.generate(table, () => ({}));
  const parserGenerator = getSelfHostedParserGenerator(selfhosted as any);

  let states: ListNode<StateNode>;
  try {
    const parser = parserGenerator.generate(lexer, {
      reducer: ({ bag, name }) => reducers[name ?? ""](bag),
    });
    states = parser.parse().result as ListNode<StateNode>;
  } catch (err) {
    if (err instanceof LR1ParserGraveError && err.currentToken != null)
      return { success: false, reason: err.reason, token: err.currentToken as GrammarToken };
    return { success: false, reason: describeThrowable(err), token: syntheticGrammarToken() };
  }

  const tableStates = states.getItemsReversed().map((state) => state.toTableState());
  return validateTableStates(tableStates, options);
};

export const buildStates = (table: string, options: BuildStatesOptions = {}): TableState[] => {
  const result = tryBuildStates(table, options);
  if (result.success === false)
    throw new Error(
      `Encountered error "${result.reason}" while parsing the parsing table at ${result.token.line}:${result.token.column}`,
    );
  return result.value;
};
