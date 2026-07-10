import { RegexEngine, Slex } from "@scinorandex/slex";
import { Result, Sparse } from "../index";
import { selfhosted } from "./states";
import { TableState } from "../parser";
import { GrammarToken, GrammarTokenMetadata, GrammarTokenType, hydrateProduction, Production } from "./common";

export const grammarLexerGenerator = new Slex<GrammarTokenType, GrammarTokenMetadata>({
  EOF_TYPE: GrammarTokenType.EOF,
  isHigherPrecedence: () => false,
});

grammarLexerGenerator.addRule(
  "lowercase",
  "a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z",
);
grammarLexerGenerator.addRule(
  "uppercase",
  "A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z",
);
grammarLexerGenerator.addRule("letter", "${lowercase} | ${uppercase}");
grammarLexerGenerator.addRule("digit", "0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9");
grammarLexerGenerator.addRule("alphanumeric", "${letter} | ${digit}");
grammarLexerGenerator.addRule(
  "identifier",
  "(${letter} | $_) (${letter} | ${digit} | $_)*",
  GrammarTokenType.IDENTIFIER,
);
grammarLexerGenerator.addRule("colon", "$:", GrammarTokenType.COLON);
grammarLexerGenerator.addRule("semicolon", "$;", GrammarTokenType.SEMICOLON);
grammarLexerGenerator.addRule("langle", "$<", GrammarTokenType.L_ANGLE);
grammarLexerGenerator.addRule("rangle", "$>", GrammarTokenType.R_ANGLE);
grammarLexerGenerator.addRule("lbracket", "$[", GrammarTokenType.L_BRACKET);
grammarLexerGenerator.addRule("rbracket", "$]", GrammarTokenType.R_BRACKET);
grammarLexerGenerator.addRule("lparen", "$(", GrammarTokenType.L_PAREN);
grammarLexerGenerator.addRule("rparen", "$)", GrammarTokenType.R_PAREN);
grammarLexerGenerator.addRule("pipe", "$|", GrammarTokenType.PIPE);
grammarLexerGenerator.addRule("equals", "$=", GrammarTokenType.EQUALS);
grammarLexerGenerator.addRule("comma", "$,", GrammarTokenType.COMMA);
grammarLexerGenerator.addRule("question_mark", "$?", GrammarTokenType.QUESTION_MARK);
grammarLexerGenerator.addRule("number", "(${digit})+", GrammarTokenType.NUMBER);

export abstract class BaseNode {}

export class ListNode<T> extends BaseNode {
  private items: T[];

  constructor(items: T | T[]) {
    super();

    if (Array.isArray(items)) this.items = items;
    else this.items = [items];
  }

  add(item: T) {
    this.items.push(item);
    return this;
  }

  getItems() {
    return this.items;
  }

  getItemsReversed() {
    return this.items.toReversed();
  }
}

class ProductionNode extends BaseNode {
  constructor(
    public readonly lhs: GrammarToken,
    public readonly rhs: ListNode<TokenNode | GroupedTokenNode>,
    public originalProductionIndex: number,
  ) {
    super();
  }

  toStruct(): Production {
    if (this.originalProductionIndex === -1) throw new Error("ProductionNode has no originalProductionIndex");

    const hasGrouped = this.rhs.getItemsReversed().some((node) => node instanceof GroupedTokenNode);
    if (hasGrouped) throw new Error("Need to unroll before serializing");

    return {
      lhs: this.lhs,
      identifier: `<${this.lhs.lexeme}>`,
      originalProductionIndex: this.originalProductionIndex,
      rhs: this.rhs.getItemsReversed().map((node) => (node as TokenNode).toStruct()),
    };
  }

  setOriginalProductionIndex(index: number) {
    this.originalProductionIndex = index;
  }
}

function expandProduction(production: ProductionNode): ProductionNode[] {
  const rhs = production.rhs.getItemsReversed();

  for (let i = 0; i < rhs.length; i++) {
    const item = rhs[i];

    const beforeItems = rhs.slice(0, i);
    const afterItems = rhs.slice(i + 1);

    if (item instanceof GroupedTokenNode) {
      // need to create two new productions, one optional and the other not
      // then apply unrolling on both

      const withoutCurrentItem = new ProductionNode(
        production.lhs,
        new ListNode<TokenNode | GroupedTokenNode>([...beforeItems, ...afterItems].toReversed()),
        production.originalProductionIndex,
      );

      const withCurrentItem = new ProductionNode(
        production.lhs,
        new ListNode<TokenNode | GroupedTokenNode>(
          [...beforeItems, ...item.inside.getItemsReversed(), ...afterItems].toReversed(),
        ),
        production.originalProductionIndex,
      );

      const newProductions: ProductionNode[] = [withoutCurrentItem, withCurrentItem];
      return newProductions.flatMap((prod) => expandProduction(prod));
    } else if (item instanceof TokenNode) {
      if (item.variables.getItems().length > 1) {
        // this token node has many variants and we should unroll it
        const variables = item.variables.getItemsReversed();

        const newProductions = variables.map((variable) => {
          return new ProductionNode(
            production.lhs,
            new ListNode<TokenNode | GroupedTokenNode>([
              ...beforeItems,
              new TokenNode("variable", new ListNode<GrammarToken>([variable]), item.name),
            ]),
            production.originalProductionIndex,
          );
        });

        return newProductions.flatMap((prod) => expandProduction(prod));
      }
    } else {
      throw new Error("shoudn't reach here, ProductionNode RHS is neither GroupedTokenNode nor TokenNode");
    }
  }

  // if it reached here then its normal
  return [production];
}

class TokenNode extends BaseNode {
  constructor(
    public readonly type: "terminal" | "variable",
    public readonly variables: ListNode<GrammarToken>,
    public readonly name: string | undefined,
  ) {
    super();
  }

  toStruct() {
    const items = this.variables.getItems();
    if (items.length > 1) throw new Error("Not yet unrolled");

    const lexeme = items[0].lexeme;
    const identifier = this.type === "variable" ? `<${lexeme}>` : `[${lexeme}]`;
    const name = this.name ?? null;

    return { type: this.type, token: items[0], identifier, name };
  }
}

class GroupedTokenNode extends BaseNode {
  constructor(public readonly inside: ListNode<TokenNode>) {
    super();
  }
}

class ProgramNode extends BaseNode {
  constructor(public readonly productions: ListNode<ProductionNode>) {
    super();
  }

  unrollProductions() {
    const productions = this.productions.getItemsReversed();
    for (let i = 0; i < productions.length; i++) productions[i].setOriginalProductionIndex(i);
    return productions.flatMap((node) => expandProduction(node));
  }

  getProductions() {
    return this.unrollProductions().map((node) => node.toStruct());
  }
}

export function getSelfHostedParserGenerator(e: typeof selfhosted = selfhosted) {
  return new Sparse<GrammarTokenType, GrammarTokenMetadata, BaseNode>({
    productions: e.productions.map((production) => hydrateProduction(production as any)),
    states: e.states.map((state) => TableState.fromJSObject(state as any)),
    toStringifiedTokenType: (type: GrammarTokenType) => GrammarTokenType[type],
  });
}

type Reducer = (bag: any) => BaseNode;
const reducers: Reducer[] = [
  undefined as any,

  (bag: { productions?: ListNode<ProductionNode> }) =>
    new ProgramNode(bag.productions ?? new ListNode<ProductionNode>([])),

  (bag: { production: ProductionNode; rest?: ListNode<ProductionNode> }) => {
    if (bag.rest == null) return new ListNode<ProductionNode>([bag.production]);
    else return bag.rest.add(bag.production);
  },

  (bag: { production_name: GrammarToken; tokens: ListNode<TokenNode | GroupedTokenNode> }) =>
    new ProductionNode(bag.production_name, bag.tokens, -1),

  (bag: { token: TokenNode | GroupedTokenNode; rest?: ListNode<TokenNode | GroupedTokenNode> }) => {
    if (bag.rest == null) return new ListNode<TokenNode | GroupedTokenNode>([bag.token]);
    else return bag.rest.add(bag.token);
  },

  (bag: { token: TokenNode }) => bag.token,
  (bag: { tokens: ListNode<TokenNode> }) => new GroupedTokenNode(bag.tokens),

  (bag: { inside: ListNode<GrammarToken>; token_name?: GrammarToken }) =>
    new TokenNode("variable", bag.inside, bag.token_name?.lexeme),

  (bag: { inside: ListNode<GrammarToken>; token_name?: GrammarToken }) =>
    new TokenNode("terminal", bag.inside, bag.token_name?.lexeme),

  (bag: { identifier: GrammarToken; rest?: ListNode<GrammarToken> }) => {
    if (bag.rest == null) return new ListNode<GrammarToken>([bag.identifier]);
    else return bag.rest.add(bag.identifier);
  },
];

export const tryBuildProductions = (lexer: LexerInterface | string): Result<Production[]> => {
  if (typeof lexer === "string") lexer = grammarLexerGenerator.generate(lexer, () => ({}));

  const parserGenerator = getSelfHostedParserGenerator();
  const parser = parserGenerator.generate(lexer as RegexEngine<GrammarTokenType, GrammarTokenMetadata>, {
    reducer: (_, productionIndex, bag) => reducers[productionIndex](bag),
  });

  const parsingResult = parser.parse().result as ProgramNode;
  const productions = parsingResult.getProductions();
  return { success: true, value: productions };
};

interface LexerInterface {
  peekNextToken(): GrammarToken;
  getNextToken(): GrammarToken;
  hasNextToken(): boolean;
}

export const buildProductions = (lexer: LexerInterface | string): Production[] => {
  const result = tryBuildProductions(lexer);
  if (result.success === false)
    throw new Error(
      `Encountered error "${result.reason}" while parsing grammar at ${result.token.line}:${result.token.column}`,
    );
  return result.value;
};
