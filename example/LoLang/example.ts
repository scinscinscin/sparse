import fs from "fs/promises";
import { buildProductions, LR1StackSymbol, Sparse } from "../../src/index";
import { ColumnAndRow, Slex, Token } from "@scinorandex/slex";

// prettier-ignore
enum LoLangTokenType {
  EOF,

  IMPORT,
  VARIABLE, CONSTANT,
  FUNCTION, OBJECT,

  RETURN,

  TRY, CATCH, THROW,
  IF, ELSE, ELIF,
  SWITCH, DEFAULT, CASE, SWITCH_BREAK, SWITCH_GOTO,

  FOR, OF, WHILE, LOOP_BREAK, LOOP_CONTINUE,
  IDENTIFIER,
  NUMBER_TYPE, BOOLEAN_TYPE, STRING_TYPE, VOID_TYPE,

  L_PAREN, R_PAREN, L_CURLY_BRACE, R_CURLY_BRACE, L_BRACE, R_BRACE,
  EQUALS, COMMA, MINUS_R_ANGLE_BAR, DOT, COLON, SEMICOLON,

  // LOGICAL AND BITWISE OPERATORS
  EXCLAMATION, DOUBLE_AMPERSAND, DOUBLE_PIPE, CARAT, AMPERSAND, PIPE,

  // RELATIONAL AND EQUALITY OPERATORS
  DOUBLE_EQUALS, EXCLAMATION_EQUALS, L_ANGLE_BAR, R_ANGLE_BAR, L_ANGLE_BAR_EQUALS, R_ANGLE_BAR_EQUALS,

  // SHIFTING OPERATORS
  DOUBLE_L_ANGLE_BAR, DOUBLE_R_ANGLE_BAR,

  // ARITHMETIC OPERATORS
  PLUS, MINUS, STAR, FORWARD_SLASH, PERCENT, DOUBLE_STAR,

  // INCREMENTATION OPERATOR
  DOUBLE_PLUS, DOUBLE_MINUS,

  STRING_LITERAL, NUMBER_LITERAL, BOOLEAN_LITERAL, NULL_LITERAL
}

const lexerGenerator = new Slex<LoLangTokenType, {}>({
  EOF_TYPE: LoLangTokenType.EOF,
  isHigherPrecedence: ({ current, next }) => current === LoLangTokenType.IDENTIFIER,
});
{
  lexerGenerator.addRule("plus", "$+", LoLangTokenType.PLUS);
  lexerGenerator.addRule("minus", "$-", LoLangTokenType.MINUS);
  lexerGenerator.addRule("star", "$*", LoLangTokenType.STAR);
  lexerGenerator.addRule("forward_slash", "$/", LoLangTokenType.FORWARD_SLASH);
  lexerGenerator.addRule("percent", "$%", LoLangTokenType.PERCENT);
  lexerGenerator.addRule("double_star", "$*$*", LoLangTokenType.DOUBLE_STAR);
  lexerGenerator.addRule("double_plus", "$+$+", LoLangTokenType.DOUBLE_PLUS);
  lexerGenerator.addRule("double_minus", "$-$-", LoLangTokenType.DOUBLE_MINUS);

  lexerGenerator.addRule("double_l_angle_bar", "$>$>", LoLangTokenType.DOUBLE_L_ANGLE_BAR);
  lexerGenerator.addRule("double_r_angle_bar", "$<$<", LoLangTokenType.DOUBLE_R_ANGLE_BAR);
  lexerGenerator.addRule("pipe", "$|", LoLangTokenType.PIPE);
  lexerGenerator.addRule("ampersand", "$&", LoLangTokenType.AMPERSAND);
  lexerGenerator.addRule("carat", "$^", LoLangTokenType.CARAT);

  lexerGenerator.addRule("l_angle_bar", "$<", LoLangTokenType.L_ANGLE_BAR);
  lexerGenerator.addRule("l_angle_bar_equals", "$<$=", LoLangTokenType.L_ANGLE_BAR_EQUALS);
  lexerGenerator.addRule("r_angle_bar", "$>", LoLangTokenType.R_ANGLE_BAR);
  lexerGenerator.addRule("r_angle_bar_equals", "$>$=", LoLangTokenType.R_ANGLE_BAR_EQUALS);
  lexerGenerator.addRule("exclamation_equals", "$!$=", LoLangTokenType.EXCLAMATION_EQUALS);
  lexerGenerator.addRule("double_equals", "$=$=", LoLangTokenType.DOUBLE_EQUALS);

  lexerGenerator.addRule("double_ampersand", "$&$&", LoLangTokenType.DOUBLE_AMPERSAND);
  lexerGenerator.addRule("double_pipe", "$|$|", LoLangTokenType.DOUBLE_PIPE);
  lexerGenerator.addRule("exclamation", "$!", LoLangTokenType.EXCLAMATION);

  lexerGenerator.addRule("minus_r_angle_bar", "$-$>", LoLangTokenType.MINUS_R_ANGLE_BAR);
  lexerGenerator.addRule("equals", "$=", LoLangTokenType.EQUALS);
  lexerGenerator.addRule("comma", "$,", LoLangTokenType.COMMA);
  lexerGenerator.addRule("dot", "$.", LoLangTokenType.DOT);
  lexerGenerator.addRule("colon", "$:", LoLangTokenType.COLON);
  lexerGenerator.addRule("semicolon", "$;", LoLangTokenType.SEMICOLON);

  lexerGenerator.addRule("l_paren", "$(", LoLangTokenType.L_PAREN);
  lexerGenerator.addRule("r_paren", "$)", LoLangTokenType.R_PAREN);
  lexerGenerator.addRule("l_brace", "$[", LoLangTokenType.L_BRACE);
  lexerGenerator.addRule("r_brace", "$]", LoLangTokenType.R_BRACE);
  lexerGenerator.addRule("l_curly_brace", "${", LoLangTokenType.L_CURLY_BRACE);
  lexerGenerator.addRule("r_curly_brace", "$}", LoLangTokenType.R_CURLY_BRACE);

  lexerGenerator.addRule("lowercase", "a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z");
  lexerGenerator.addRule("uppercase", "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z");
  lexerGenerator.addRule("letter", "${lowercase}|${uppercase}");
  lexerGenerator.addRule(
    "symbols",
    "$ | $! | $@ | $# | $$ | $% | $^ | $& | $* | $( | $) | ${ | $[ | $} | $] | $; | $: | $< | $, | $. | $> | $? | $/ | $` | $~ | $- | $_ | $+ | $= | $|"
  );
  lexerGenerator.addRule("escape_character", "$\\ | $\n | $\t | $\r | $\\$\" | $\\$'");
  lexerGenerator.addRule("digit", "0|1|2|3|4|5|6|7|8|9");
  lexerGenerator.addRule("character", "${letter}|${digit}|${symbols}|${escape_character}");

  lexerGenerator.addRule("float_number", "(${digit})+$.(${digit})+");
  lexerGenerator.addRule("decimal_number", "(${digit})+");
  lexerGenerator.addRule("octal_number", "0e(0|1|2|3|4|5|6|7)+");
  lexerGenerator.addRule("hexadecimal_number", "0x(${digit}|a|b|c|d|e|f|A|B|C|D|E|F)+");
  lexerGenerator.addRule("binary_number", "0b(0|1)+");

  // handle literal tokens
  lexerGenerator.addRule(
    "string_literal",
    "$\"(${character} | $')*$\" | $'(${character} | $\")*$'",
    LoLangTokenType.STRING_LITERAL,
    (str) => str.substring(1, str.length - 1).replaceAll("\\n", "\n")
  );
  lexerGenerator.addRule(
    "number_literal",
    "${float_number}|${decimal_number}|${octal_number}|${binary_number}|${hexadecimal_number}",
    LoLangTokenType.NUMBER_LITERAL
  );
  lexerGenerator.addRule("boolean_literal", "faker|shaker", LoLangTokenType.BOOLEAN_LITERAL);
  lexerGenerator.addRule("null_literal", "cooldown", LoLangTokenType.NULL_LITERAL);

  // handle identifier and reserved words
  lexerGenerator.addRule("item", "item", LoLangTokenType.VARIABLE);
  lexerGenerator.addRule("rune", "rune", LoLangTokenType.CONSTANT);
  lexerGenerator.addRule("skill", "skill", LoLangTokenType.FUNCTION);
  lexerGenerator.addRule("steal", "steal", LoLangTokenType.IMPORT);
  lexerGenerator.addRule("build", "build", LoLangTokenType.OBJECT);
  lexerGenerator.addRule("canwin", "canwin", LoLangTokenType.IF);
  lexerGenerator.addRule("remake", "remake", LoLangTokenType.ELIF);
  lexerGenerator.addRule("lose", "lose", LoLangTokenType.ELSE);
  lexerGenerator.addRule("channel", "channel", LoLangTokenType.SWITCH);
  lexerGenerator.addRule("teleport", "teleport", LoLangTokenType.CASE);
  lexerGenerator.addRule("recall", "recall", LoLangTokenType.DEFAULT);
  lexerGenerator.addRule("flash", "flash", LoLangTokenType.SWITCH_GOTO);
  lexerGenerator.addRule("cancel", "cancel", LoLangTokenType.SWITCH_BREAK);
  lexerGenerator.addRule("wave", "wave", LoLangTokenType.WHILE);
  lexerGenerator.addRule("cannon", "cannon", LoLangTokenType.FOR);
  lexerGenerator.addRule("clear", "clear", LoLangTokenType.LOOP_BREAK);
  lexerGenerator.addRule("next", "next", LoLangTokenType.LOOP_CONTINUE);
  lexerGenerator.addRule("of", "of", LoLangTokenType.OF);
  lexerGenerator.addRule("support", "support", LoLangTokenType.TRY);
  lexerGenerator.addRule("carry", "carry", LoLangTokenType.CATCH);
  lexerGenerator.addRule("feed", "feed", LoLangTokenType.THROW);
  lexerGenerator.addRule("recast", "recast", LoLangTokenType.RETURN);

  // handle type tokens
  lexerGenerator.addRule("number_type", "stats", LoLangTokenType.NUMBER_TYPE);
  lexerGenerator.addRule("boolean_type", "goat", LoLangTokenType.BOOLEAN_TYPE);
  lexerGenerator.addRule("string_type", "message", LoLangTokenType.STRING_TYPE);
  lexerGenerator.addRule("void_type", "passive", LoLangTokenType.VOID_TYPE);
  lexerGenerator.addRule("identifier", "(${letter}|$_)(${letter}|${digit}|$_)*", LoLangTokenType.IDENTIFIER);
}

type StringifiedNode = (StringifiedNode | string)[];
class Node {
  constructor(public readonly nodes: LR1StackSymbol<LoLangTokenType, {}, Node>[]) {}
  toObject(): StringifiedNode {
    return this.nodes.map((node) => (node.type === "token" ? node.token.lexeme : node.node.toObject()));
  }
}

async function main() {
  const exampleSourceCode = await fs.readFile("./example/LoLang/Features_Array_Methods.lol", "utf8");
  const lexer = lexerGenerator.generate(exampleSourceCode, () => ({}));

  const toStringifiedTokenType = (type: LoLangTokenType) => LoLangTokenType[type];
  const productions = buildProductions(await fs.readFile("./example/LoLang/grammar.txt", "utf8"));
  const parserGenerator = Sparse.fromProductions<LoLangTokenType, {}, Node>({ productions, toStringifiedTokenType });

  const parser = parserGenerator.generate(lexer, {
    reducer: (input, productionIndex) => new Node(input),
    recover({ lexer, statesStack, symbolsStack, isSafe, addError, crash, finish, states }) {
      let token = lexer.peekNextToken();
      const currentState = statesStack.peek();

      // check for extra semicolons
      if (token.type === LoLangTokenType.SEMICOLON) {
        while (lexer.peekNextToken().type === LoLangTokenType.SEMICOLON) token = lexer.getNextToken();
        if (isSafe()) return finish();
      }

      token = lexer.peekNextToken();

      // check for lacking semicolons
      if (states[currentState].actions.has("[SEMICOLON]")) {
        const action = states[currentState].getTerminalAction("SEMICOLON");
        const newToken = new Token<LoLangTokenType, {}>(
          LoLangTokenType.SEMICOLON,
          ";",
          new ColumnAndRow(token.column, token.line),
          token.metadata
        );

        if (action) {
          if (action.type === "reduce") return finish({ newToken });

          statesStack.push(action.value);
          symbolsStack.push({ type: "token", token: newToken });
          addError(
            `Expected SEMICOLON but received ${LoLangTokenType[token.type]}. SEMICOLON was automatically inserted.`
          );
        }

        if (isSafe()) return finish();
      }

      console.log(lexer.peekNextToken());
      return crash("Invalid syntax.");
    },
  });

  console.log(parser.parse());
}

main();
