import { ColumnAndRow, Token } from "@scinorandex/slex";

export type Production = {
  lhs: GrammarToken;
  identifier: string;
  originalProductionIndex: number;
  name: string | null;
  rhs: { type: "terminal" | "variable"; token: GrammarToken; identifier: string; name: string | null }[];
};

const dehydateGrammarToken = ({ column, lexeme, line, type }: GrammarToken) => {
  return { column, lexeme, line, type };
};

const hydrateGrammarToken = (
  token: ReturnType<typeof dehydateGrammarToken>,
): Token<GrammarTokenType, GrammarTokenMetadata> => {
  return new Token(token.type, token.lexeme, new ColumnAndRow(token.line, token.column), {});
};

export const dehydateProduction = (opts: Production) => {
  const { lhs, identifier, rhs, originalProductionIndex, name } = opts;
  return {
    lhs: dehydateGrammarToken(lhs),
    identifier,
    name,
    originalProductionIndex,
    rhs: rhs.map(({ type, token, identifier, name }) => ({
      type,
      token: dehydateGrammarToken(token),
      identifier,
      name,
    })),
  };
};

export const hydrateProduction = (production: ReturnType<typeof dehydateProduction>): Production => {
  return {
    lhs: hydrateGrammarToken(production.lhs),
    identifier: production.identifier,
    originalProductionIndex: production.originalProductionIndex,
    name: production.name,
    rhs: production.rhs.map(({ type, token, name }) => ({
      type,
      token: hydrateGrammarToken(token),
      identifier: token.lexeme,
      name,
    })),
  };
};

export type GrammarTokenMetadata = {};
export enum GrammarTokenType {
  IDENTIFIER,
  L_ANGLE,
  R_ANGLE,
  L_BRACKET,
  R_BRACKET,
  L_PAREN,
  R_PAREN,
  PIPE,
  QUESTION_MARK,
  COLON,
  SEMICOLON,
  NUMBER,
  EQUALS,
  COMMA,
  EOF,
  SINGLE_LINE_COMMENT,
  MULTI_LINE_COMMENT,

  PRODUCTION_NAME,
  TOKEN_NAME,
}

export type GrammarToken = Token<GrammarTokenType, GrammarTokenMetadata>;
