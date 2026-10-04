import path from "path";
import fs from "fs/promises";
import { Slex } from "@scinorandex/slex";

// prettier-ignore
export enum MathTokenType {
  PLUS, MINUS, STAR, SLASH, NUMBER, EOF
}

export type MathMetadata = {};

export const mathLexerGenerator = new Slex<MathTokenType, MathMetadata>({
  EOF_TYPE: MathTokenType.EOF,
  isHigherPrecedence: () => false,
});

mathLexerGenerator.addRule("plus", "$+", MathTokenType.PLUS);
mathLexerGenerator.addRule("minus", "$-", MathTokenType.MINUS);
mathLexerGenerator.addRule("star", "$*", MathTokenType.STAR);
mathLexerGenerator.addRule("forward_slash", "$/", MathTokenType.SLASH);
mathLexerGenerator.addRule("digit", "0|1|2|3|4|5|6|7|8|9");
mathLexerGenerator.addRule("float_number", "(${digit})+$.(${digit})+");
mathLexerGenerator.addRule("decimal_number", "(${digit})+");
mathLexerGenerator.addRule("number_literal", "${float_number}|${decimal_number}", MathTokenType.NUMBER);

export const mathLexer = (source: string) => mathLexerGenerator.generate(source, () => ({}));

// prettier-ignore
export enum SemiTokenType {
  NUMBER, SEMICOLON, EOF
}

/** A lexer whose grammar mentions a SEMICOLON, for the error recovery tests. */
export const semiLexer = (source: string) => {
  const generator = new Slex<SemiTokenType, {}>({
    EOF_TYPE: SemiTokenType.EOF,
    isHigherPrecedence: () => false,
  });
  generator.addRule("semicolon", "$;", SemiTokenType.SEMICOLON);
  generator.addRule("digit", "0|1|2|3|4|5|6|7|8|9");
  generator.addRule("number", "(${digit})+", SemiTokenType.NUMBER);
  return generator.generate(source, () => ({}));
};

export const root = path.join(__dirname, "..");

export const examplePath = (...segments: string[]) => path.join(root, "example", ...segments);

export const readExample = (...segments: string[]) => fs.readFile(examplePath(...segments), "utf8");

export const readFile = (filePath: string) => fs.readFile(path.resolve(root, "example", filePath), "utf8");

export const EXAMPLE_GRAMMARS: [string, string][] = [
  ["math", examplePath("math/grammar.txt")],
  ["kleene-test", examplePath("kleene-test/grammar.txt")],
  ["LoLang", examplePath("LoLang/grammar.txt")],
  ["selfhosted meta", examplePath("selfhosted/01-meta-grammar.txt")],
  ["selfhosted table", examplePath("selfhosted/02-table-grammar.txt")],
];
