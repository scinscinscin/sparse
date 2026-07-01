import { GrammarToken } from "../grammarParser";

export const buildErrorWindow = (file: string, token: GrammarToken) => {
  const lines = file.split("\n");

  const length = Math.max(`${token.line}`.length, `${token.column}`.length);
  let second = "",
    third = "";

  for (let i = 0; i < token.column + length + 3; i++) {
    second += " ";
    third += "-";
  }
  second += "|";
  third += "┘";

  let window = `${token.line.toString().padStart(length)} | ${
    lines.length <= token.line - 1 ? "" : lines[token.line - 1]
  }\n${second}\n${third}\n`;

  if (token.line < lines.length) window += `${(token.line + 1).toString().padStart(length)} | ${lines[token.line]}\n`;
  return window;
};
