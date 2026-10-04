import { ColumnAndRow, Token } from "@scinorandex/slex";
import { Result } from "../utils/Result";

export type Production = {
  lhs: GrammarToken;
  identifier: string;
  originalProductionIndex: number;
  name: string | null;
  rhs: { type: "terminal" | "variable"; token: GrammarToken; identifier: string; name: string | null }[];
};

export type ProductionRhsItem = Production["rhs"][number];

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

/** A readable one-liner for an unknown thrown value, used to turn it into a `Result` failure. */
export const describeThrowable = (err: unknown) =>
  err instanceof Error ? err.message : `Unexpected error: ${String(err)}`;

/** A stand-in token used to report errors that do not belong to a specific place in a grammar. */
export const syntheticGrammarToken = () =>
  new Token(GrammarTokenType.EOF, "", new ColumnAndRow(0, 0), {}) as GrammarToken;

export type ProductionWarningKind = "duplicate-rhs-name" | "unreachable-production";

export type ProductionWarning = {
  kind: ProductionWarningKind;
  reason: string;
  token: GrammarToken;
};

export type ValidateProductionsOptions = {
  /** Called once per warning. Warnings never stop the parser generator, they only flag suspicious grammars. */
  onWarning?: (warning: ProductionWarning) => void;
};

const at = (token: GrammarToken) => `${token.line}:${token.column}`;

/**
 * Checks a set of unrolled productions for the mistakes that would otherwise surface as an
 * inscrutable `TypeError` deep inside state generation or parsing:
 *
 * - a variable used on the right hand side that no production defines
 * - a production with an empty right hand side (Sparse has no support for empty productions)
 * - the start symbol being used on the right hand side (it must only appear on the left hand side)
 *
 * Suspicious-but-legal grammars (duplicate symbol names, unreachable productions) are reported
 * through `onWarning` instead of failing.
 */
export const validateProductions = (
  productions: Production[],
  options: ValidateProductionsOptions = {},
): Result<Production[]> => {
  const warn = (kind: ProductionWarningKind, reason: string, token: GrammarToken) => {
    options.onWarning?.({ kind, reason, token });
  };

  if (productions.length === 0)
    return {
      success: false,
      reason: "The grammar does not contain any productions. Is the grammar file empty?",
      token: syntheticGrammarToken(),
    };

  const lhsIdentifiers = new Set(productions.map((production) => production.identifier));
  const referencedIdentifiers = new Set<string>();

  for (const production of productions) {
    if (production.rhs.length === 0)
      return {
        success: false,
        reason: `Production "${production.identifier}" (line ${at(production.lhs)}) has an empty right hand side. Sparse does not support empty productions, so a lone "(...)? " group such as "<X: x>: ([A])?;" is not a valid production.`,
        token: production.lhs,
      };

    const seenNames = new Set<string>();
    for (const rhsItem of production.rhs) {
      if (rhsItem.type === "variable") {
        referencedIdentifiers.add(rhsItem.identifier);
        if (lhsIdentifiers.has(rhsItem.identifier) === false)
          return {
            success: false,
            reason: `Variable "${rhsItem.identifier}" is used on the right hand side of production "${production.identifier}" (line ${at(production.lhs)}) but no production defines it as its left hand side.`,
            token: rhsItem.token,
          };
      }

      if (rhsItem.name != null) {
        if (seenNames.has(rhsItem.name))
          warn(
            "duplicate-rhs-name",
            `Production "${production.identifier}" (line ${at(production.lhs)}) names more than one symbol "${rhsItem.name}". Only the last one ends up on the reducer's "bag", use the positional input to reach the others.`,
            rhsItem.token,
          );
        seenNames.add(rhsItem.name);
      }
    }
  }

  // The first production is the accept production: its left hand side is the start symbol, which
  // by definition cannot be referenced from the right hand side of anything.
  const startProduction = productions[0];
  if (referencedIdentifiers.has(startProduction.identifier))
    return {
      success: false,
      reason: `"${startProduction.identifier}" is the start symbol of the grammar, so it cannot be used on the right hand side of a production. It is used at line ${at(startProduction.lhs)}.`,
      token: startProduction.lhs,
    };

  for (let i = 1; i < productions.length; i++) {
    const production = productions[i];
    if (referencedIdentifiers.has(production.identifier)) continue;
    warn(
      "unreachable-production",
      `Production "${production.identifier}" (line ${at(production.lhs)}) is never used on the right hand side of another production, so the parser can never reach it.`,
      production.lhs,
    );
  }

  return { success: true, value: productions };
};

/** True when the identifier is a variable (`<FOO>`) rather than a terminal (`[FOO]`). */
export const isVariableIdentifier = (identifier: string) => identifier.startsWith("<") && identifier.endsWith(">");

export const terminalIdentifier = (name: string) => `[${name}]`;
export const variableIdentifier = (name: string) => `<${name}>`;
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
  STAR,
  PLUS,
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
