import { Slex } from "@scinorandex/slex";
import { Result } from "../utils/Result";
import { GrammarToken, GrammarTokenMetadata, GrammarTokenType, Production } from "./common";

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
grammarLexerGenerator.addRule("identifier", "(${letter} | ${digit} | $_)*");
grammarLexerGenerator.addRule("colon", "$:", GrammarTokenType.COLON);
grammarLexerGenerator.addRule("semicolon", "$;", GrammarTokenType.SEMICOLON);
grammarLexerGenerator.addRule("production_name", "$< ${identifier} $>", GrammarTokenType.PRODUCTION_NAME);
grammarLexerGenerator.addRule("token_name", "$[ ${identifier} $]", GrammarTokenType.TOKEN_NAME);

interface LexerInterface {
  peekNextToken(): GrammarToken;
  getNextToken(): GrammarToken;
  hasNextToken(): boolean;
}

export const tryBuildProductions = (lexer: LexerInterface | string): Result<Production[]> => {
  if (typeof lexer === "string") lexer = grammarLexerGenerator.generate(lexer, () => ({}));

  const productions: Production[] = [];

  const expect = (type: GrammarTokenType) => {
    const token = lexer.peekNextToken();
    if (token.type !== type) throw new Error(`Expected ${type}, got ${token.type}`);
    lexer.getNextToken();
  };

  let productionIndex = 0;

  const buildProduction = (): Result<Production> => {
    const productionLHS = lexer.getNextToken();
    expect(GrammarTokenType.COLON);

    const production: Production = {
      lhs: productionLHS,
      identifier: productionLHS.lexeme,
      rhs: [],
      name: null,
      originalProductionIndex: productionIndex++,
    };

    while (lexer.peekNextToken().type != GrammarTokenType.SEMICOLON) {
      const productionRHS = lexer.getNextToken();

      if (productionRHS.type == GrammarTokenType.PRODUCTION_NAME)
        production.rhs.push({ type: "variable", token: productionRHS, identifier: productionRHS.lexeme, name: null });
      else if (productionRHS.type == GrammarTokenType.TOKEN_NAME)
        production.rhs.push({ type: "terminal", token: productionRHS, identifier: productionRHS.lexeme, name: null });
      else
        return {
          success: false,
          reason: `Unexpected token type: ${GrammarTokenType[productionRHS.type]}`,
          token: productionRHS,
        };
    }

    expect(GrammarTokenType.SEMICOLON);
    return { success: true, value: production };
  };

  while (lexer.hasNextToken()) {
    const result = buildProduction();
    if (result.success === false) return result;
    productions.push(result.value);
  }

  return { success: true, value: productions };
};

export const buildProductions = (lexer: LexerInterface | string): Production[] => {
  const result = tryBuildProductions(lexer);
  if (result.success === false)
    throw new Error(
      `Encountered error "${result.reason}" while parsing grammar at ${result.token.line}:${result.token.column}`,
    );
  return result.value;
};
