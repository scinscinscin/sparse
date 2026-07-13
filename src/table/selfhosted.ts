import { GrammarToken } from "../meta/common";
import { BaseNode, getSelfHostedParserGenerator, grammarLexerGenerator, ListNode } from "../meta/selfhosted";
import { TableAction, TableState } from "../parser";
import { selfhosted } from "./states";

class StateNode extends BaseNode {
  constructor(public readonly items: ListNode<ItemNode>) {
    super();
  }

  toTableState(): TableState {
    const state = new TableState();
    for (const item of this.items.getItems()) {
      const key = item.type === "terminal" ? `[${item.name.lexeme}]` : `<${item.name.lexeme}>`;
      state.actions.set(key, item.action);
    }
    return state;
  }
}

class ItemNode extends BaseNode {
  constructor(
    public readonly type: "terminal" | "variable",
    public readonly name: GrammarToken,
    public readonly action: TableAction,
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
    return new ItemNode("terminal", bag.name, action);
  },

  variable: (bag: { name: GrammarToken; state: GrammarToken }) => {
    const action: TableAction = { type: "goto", value: parseInt(bag.state.lexeme) };
    return new ItemNode("variable", bag.name, action);
  },
};

export const buildStates = (grammar: string): TableState[] => {
  const lexer = grammarLexerGenerator.generate(grammar, () => ({}));
  const parserGenerator = getSelfHostedParserGenerator(selfhosted as any);
  const parser = parserGenerator.generate(lexer, {
    reducer: ({ bag, name }) => reducers[name ?? ""](bag),
  });

  const parsingResult = (parser.parse().result as ListNode<StateNode>).getItemsReversed();
  return parsingResult.map((state) => state.toTableState());
};
