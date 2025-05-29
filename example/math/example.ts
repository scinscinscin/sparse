import { Slex } from "@scinorandex/slex";
import { buildProductions, buildStates, LR1StackSymbol, Sparse } from "../../src/index";
import fs from "fs/promises";

// prettier-ignore
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

type StringifiedNode = (StringifiedNode | string)[];
class Node {
  constructor(public readonly nodes: LR1StackSymbol<TokenType, Metadata, Node>[]) {}
  toObject(): StringifiedNode {
    return this.nodes.map((node) => (node.type === "token" ? node.token.lexeme : node.node.toObject()));
  }
}

async function main() {
  const toStringifiedTokenType = (type: TokenType) => TokenType[type];
  const productions = buildProductions(await fs.readFile("./example/math/grammar.txt", "utf8"));
  const states = buildStates(await fs.readFile("./example/math/table.txt", "utf8"));
  const parserGenerator = new Sparse<TokenType, Metadata, Node>({ productions, states, toStringifiedTokenType });

  const parser = parserGenerator.generate(lexer, {
    reducer: (input, productionIndex) => new Node(input),
  });

  console.log(parser.parse().result!.toObject());
}

main();
