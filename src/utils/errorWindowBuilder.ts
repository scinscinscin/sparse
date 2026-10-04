import { GrammarToken } from "../meta/common";

/**
 * Renders the lines around a grammar token and points at the token itself, so that a syntax or
 * table error tells the user exactly which part of their file to look at.
 */
export const buildErrorWindow = (file: string, token: GrammarToken) => {
  const lines = file.split("\n");
  const lineNumberWidth = `${token.line}`.length;
  const gutter = (line: number) => `${`${line}`.padStart(lineNumberWidth)} | `;

  const sourceLine = lines[token.line - 1];
  const nextLine = lines[token.line];

  const pointerColumn = Math.max(0, Math.min(token.column, sourceLine === undefined ? 0 : sourceLine.length));
  const pointerLength = Math.max(1, Math.min(token.lexeme === "" ? 1 : token.lexeme.length, sourceLine === undefined ? 1 : sourceLine.length - pointerColumn));
  const pointer = `${" ".repeat(pointerColumn)}${"~".repeat(pointerLength)}`;

  let window = `${gutter(token.line)}${sourceLine ?? "<end of file>"}\n`;
  window += `${" ".repeat(lineNumberWidth)} | ${pointer}\n`;

  if (nextLine !== undefined) window += `${gutter(token.line + 1)}${nextLine}\n`;

  return window;
};
