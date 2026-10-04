import { Slex } from "@scinorandex/slex";
import { LR1StackSymbol, Sparse, enumToString } from "../../src/index";
import path from "path";

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

const root = path.join(__dirname, "..", "..");

async function main() {
  // fromGrammarFile reads the grammar, reads the prebuilt table, and checks that the two match.
  const parserGenerator = await Sparse.fromGrammarFile<TokenType, Metadata, Node>({
    grammarPath: path.join(root, "example/math/grammar.txt"),
    tablePath: path.join(root, "example/math/table.txt"),
    toStringifiedTokenType: enumToString(TokenType),
    onWarning: ({ reason, token }) => console.warn(`${token.line}:${token.column} ${reason}`),
  });

  const parser = parserGenerator.generate(lexer, { reducer: (_, { input }) => new Node(input) });
  console.log(parser.parse().result!.toObject());
}

main();