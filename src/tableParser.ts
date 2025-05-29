import { Slex } from "@scinorandex/slex";
import { TableAction, TableState } from "./parser";

type TableTokenMetadata = {};
export enum TableTokenType {
  PRODUCTION_NAME,
  TOKEN_NAME,
  COMMA,
  EQUALS,
  SHIFT_ACTION,
  REDUCE_ACTION,
  GOTO_ACTION,
  EOF,
}

export const tableLexerGenerator = new Slex<TableTokenType, TableTokenMetadata>({
  EOF_TYPE: TableTokenType.EOF,
  isHigherPrecedence: () => false,
});

tableLexerGenerator.addRule(
  "lowercase",
  "a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z"
);
tableLexerGenerator.addRule(
  "uppercase",
  "A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z"
);
tableLexerGenerator.addRule("letter", "${lowercase} | ${uppercase}");
tableLexerGenerator.addRule("digit", "0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9");
tableLexerGenerator.addRule("alphanumeric", "${letter} | ${digit}");
tableLexerGenerator.addRule("identifier", "(${letter} | ${digit} | $_)*");
tableLexerGenerator.addRule("comma", "$,", TableTokenType.COMMA);
tableLexerGenerator.addRule("equals", "$=", TableTokenType.EQUALS);
tableLexerGenerator.addRule("production_name", "$< ${identifier} $>", TableTokenType.PRODUCTION_NAME);
tableLexerGenerator.addRule("token_name", "$[ ${identifier} $]", TableTokenType.TOKEN_NAME);
tableLexerGenerator.addRule("shift_action", "s(${digit})*", TableTokenType.SHIFT_ACTION);
tableLexerGenerator.addRule("reduce_action", "r(${digit})*", TableTokenType.REDUCE_ACTION);
tableLexerGenerator.addRule("goto_action", "${digit}(${digit})*", TableTokenType.GOTO_ACTION);

export const buildStates = (grammar: string) =>
  grammar.split("\n").map((line) => {
    const lexer = tableLexerGenerator.generate(line, () => ({}));
    const state = new TableState();

    const expect = (type: TableTokenType) => {
      const token = lexer.peekNextToken();
      if (token.type !== type) throw new Error(`Expected ${TableTokenType[type]}, got ${TableTokenType[token.type]}`);
      lexer.getNextToken();
    };

    while (lexer.hasNextToken()) {
      const token = lexer.getNextToken();
      expect(TableTokenType.EQUALS);
      const value = lexer.getNextToken();

      const setting: TableAction =
        token.type === TableTokenType.PRODUCTION_NAME
          ? { type: "goto", value: parseInt(value.lexeme) }
          : value.type === TableTokenType.REDUCE_ACTION
          ? { type: "reduce", value: parseInt(value.lexeme.substring(1)) }
          : { type: "shift", value: parseInt(value.lexeme.substring(1)) };

      state.actions.set(token.lexeme, setting);
      if (lexer.peekNextToken().type == TableTokenType.COMMA) lexer.getNextToken();
    }

    return state;
  });
