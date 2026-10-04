export { GeneratorResult, generateStates } from "./generator";
export type { GeneratorOptions } from "./generator";

export {
  buildProductions,
  tryBuildProductions,
  grammarLexerGenerator,
  getSelfHostedParserGenerator,
} from "./meta/selfhosted";
export type { LexerInterface } from "./meta/selfhosted";

export { Result } from "./utils/Result";
export {
  ParserRecoveryFunction,
  Sparse,
  SparseGrammarError,
  LR1ParserGraveError,
  LR1StackSymbol,
  LR1Parser,
  ParserResult,
  ParserError,
  TableAction,
  TableState,
} from "./parser";
export type { ReducerType, SparseOptions, FromProductionsOptions } from "./parser";

export { buildStates, tryBuildStates } from "./table/selfhosted";
export type { BuildStatesOptions } from "./table/selfhosted";
export { validateTable, validateTableStates } from "./table/validate";
export type { ValidateTableOptions, ValidateTableStatesOptions, TableFormatWarning } from "./table/validate";

export {
  dehydateProduction,
  hydrateProduction,
  isVariableIdentifier,
  syntheticGrammarToken,
  terminalIdentifier,
  validateProductions,
  variableIdentifier,
  GrammarTokenType,
} from "./meta/common";
export type {
  GrammarToken,
  GrammarTokenMetadata,
  Production,
  ProductionRhsItem,
  ProductionWarning,
  ProductionWarningKind,
  ValidateProductionsOptions,
} from "./meta/common";

export {
  assertReducersCoverGrammar,
  defineReducers,
  enumToString,
  missingReducerMessage,
  missingReducerNames,
  namedProductions,
  KLEENE_REDUCER_NAME,
} from "./utils/reducers";
export type { ReducerMap } from "./utils/reducers";

export { loadGrammar, loadTable } from "./utils/loadFiles";
export type { LoadGrammarOptions, LoadTableOptions } from "./utils/loadFiles";
export { buildErrorWindow } from "./utils/errorWindowBuilder";
export { Stack } from "./utils/Stack";