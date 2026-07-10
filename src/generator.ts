import { TableState } from "./parser";
import { GrammarToken, Production } from "./meta/common";
import { Result } from "./utils/Result";

const xContainsAllOfY = <T>(xs: Set<T>, ys: Set<T>) => [...ys].every((x) => xs.has(x));
const EOF_STRING = "[EOF]";

// Creates a list of first sets for each production
function computeFirstSets(allProductions: Production[]): Result<Map<string, Set<string>>> {
  // Initialize the hashmap
  const ret = new Map<string, Set<string>>();
  for (const production of allProductions) ret.set(production.identifier, new Set());

  // Keep iterating through all productions until no edits are made
  let wasEdited = true;
  while (wasEdited) {
    wasEdited = false;

    for (const production of allProductions) {
      const toBeModified = ret.get(production.identifier)!;

      const firstRhsToken = production.rhs[0];
      if (firstRhsToken.type === "variable") {
        const add = ret.get(firstRhsToken.identifier);

        if (add == null) {
          return {
            success: false,
            reason: `Variable "${firstRhsToken.identifier}" doesn't have a corresponding left hand side`,
            token: firstRhsToken.token,
          };
        }

        // check if the hashmap of the current production already contains all the items to be added
        // if not then add them and set wasEdited to true so we iterate one more time
        if (!xContainsAllOfY(toBeModified, add)) {
          wasEdited = true;
          ret.set(production.identifier, new Set([...toBeModified, ...add]));
        }
      } else if (firstRhsToken.type === "terminal") {
        // add terminal to toBeModified and set wasEdited to true
        if (toBeModified.has(firstRhsToken.identifier) == false) {
          wasEdited = true;
          ret.set(production.identifier, new Set([...toBeModified, firstRhsToken.identifier]));
        }
      }
    }
  }

  return { success: true, value: ret };
}

function computeFollowSets(
  allProductions: Production[],
): Result<{ firstSets: Map<string, Set<string>>; followSets: Map<string, Set<string>> }> {
  const firstSetsResult = computeFirstSets(allProductions);
  if (firstSetsResult.success === false) return firstSetsResult;

  const firstSets = firstSetsResult.value;

  // create a list of follow sets and add EOF to the initial production
  const ret = new Map<string, Set<string>>();
  for (const production of allProductions) ret.set(production.identifier, new Set());
  ret.get(allProductions[0].identifier)!.add(EOF_STRING);

  let wasEdited = true;
  while (wasEdited) {
    wasEdited = false;

    for (const variable of ret.keys()) {
      for (const currentProduction of allProductions) {
        // check the rhs of current production for variable
        const rhs = currentProduction.rhs;

        for (let i = 0; i < rhs.length; i++) {
          const currentRhsToken = rhs[i];

          if (currentRhsToken.type === "variable" && currentRhsToken.identifier === variable) {
            if (i === rhs.length - 1) {
              // we are at the end of rhs, so whatever is in currentProduction
              // we need to also need to add to variable
              const toBeAdded = ret.get(currentProduction.identifier)!;
              const receiver = ret.get(variable)!;
              if (!xContainsAllOfY(receiver, toBeAdded)) {
                wasEdited = true;
                ret.set(variable, new Set([...toBeAdded, ...receiver]));
              }
            } else {
              // not at the end of rhs, so we need to add the FIRST set of the next rhs token
              const nextRhsToken = rhs[i + 1];
              if (nextRhsToken.type === "terminal") {
                // next token is a terminal, check if its in existng follow set and add if it doesn't exist
                const existing = ret.get(variable)!;
                if (!existing.has(nextRhsToken.identifier)) {
                  wasEdited = true;
                  ret.set(variable, new Set([...existing, nextRhsToken.identifier]));
                }
              } else if (nextRhsToken.type === "variable") {
                // next token is a variable, get the first set of the variable
                // check if it's not in the followset and add if not
                const firstSet = firstSets.get(nextRhsToken.identifier);
                if (firstSet == null)
                  return {
                    success: false,
                    reason: `Variable "${nextRhsToken.identifier}" doesn't have a corresponding left hand side`,
                    token: nextRhsToken.token,
                  };

                if (!xContainsAllOfY(ret.get(variable)!, firstSet)) {
                  wasEdited = true;
                  ret.set(variable, new Set([...ret.get(variable)!, ...firstSet]));
                }
              }
            }
          }
        }
      }
    }
  }

  return { success: true, value: { firstSets, followSets: ret } };
}

type Item = Production & { dot: number; lookahead: string[] };
type State = { itemSet: Item[]; kernel: Item; count: number };

export const generateStates = (productions: Production[]): Result<GeneratorResult> => {
  const followSetsResult = computeFollowSets(productions);
  if (followSetsResult.success == false) return followSetsResult;

  const { firstSets, followSets } = followSetsResult.value;

  // This funciton takes a token and determines what the next lookahead should be
  // The implementation of this function ensures that the table is an LR(1) parsing table
  const determineNextLookAhead = (
    lhs: GrammarToken,
    identifier: string,
    array: { type: "terminal" | "variable"; token: GrammarToken; identifier: string }[],
  ): Result<string[]> => {
    if (array.length === 0) {
      const followSet = followSets.get(identifier);
      if (followSet != undefined) return { success: true, value: [...followSet] };

      return {
        success: false,
        reason: `Variable ${identifier} not present in computed follow sets`,
        token: lhs,
      };
    } else {
      const next = array[0];

      if (next.type === "terminal") return { success: true, value: [next.identifier] };
      const testing = firstSets.get(next.identifier);
      if (testing !== undefined) return { success: true, value: [...testing] };

      return {
        success: false,
        reason: `Variable ${next.identifier} not present in computed first sets`,
        token: next.token,
      };
    }
  };

  // This fnuction creates the initial item set based on the
  // production provided. It creating the initial item and expands it
  function generateInitialItemSet(production: Production) {
    const initialItem = {
      lhs: production.lhs,
      identifier: production.identifier,
      rhs: production.rhs,
      dot: 0,
      lookahead: [EOF_STRING],
    } as Item;

    return expandItemSet([initialItem]);
  }

  // This function expands the item sets provided to it
  function expandItemSet(items: Item[]): Result<{ itemSet: Item[]; kernel: Item }> {
    const itemSet: Item[] = [...items];

    // Create a queue of unprocessed items and keep shifting until there are no more items left
    const unprocesssedItems: Item[] = [...items];
    while (unprocesssedItems.length > 0) {
      const currentItem = unprocesssedItems.shift()!;

      // Check if the symbol after the dot is a non terminal
      const after = currentItem.rhs[currentItem.dot];
      if (after == null) continue; // TODO: check if this should be here

      if (after.type === "variable") {
        // Find prodctions whose left hand side is the symbol after the dot
        const newProductions = productions.filter((p) => p.identifier === after.identifier);

        // Compute the lookahead for the new productions to be added to the item set
        const rest = currentItem.rhs.slice(currentItem.dot + 1);

        const lookaheadResult = determineNextLookAhead(currentItem.lhs, currentItem.identifier, rest);
        if (lookaheadResult.success === false) return lookaheadResult;
        const lookahead = lookaheadResult.value;

        for (const newProduction of newProductions) {
          // Create the new item and check if it already exists in the item set
          // If it doesn't exist, add it to the item set and the queue of unprocessed items
          const newItem = {
            lhs: newProduction.lhs,
            identifier: newProduction.identifier,
            rhs: newProduction.rhs,
            dot: 0,
            lookahead,
          } as Item;
          const encoding = JSON.stringify(newItem);

          if (itemSet.some((i) => JSON.stringify(i) === encoding) == false) {
            unprocesssedItems.push(newItem);
            itemSet.push(newItem);
          }
        }
      }
    }

    // Return the item set and the kernel
    return { success: true, value: { itemSet, kernel: items[0] } };
  }

  const initialItemSetResult = generateInitialItemSet(productions[0]);
  if (initialItemSetResult.success === false) return initialItemSetResult;
  const initialItemSet = initialItemSetResult.value;

  function generateStates(_initialState: { itemSet: Item[]; kernel: Item }): Result<{
    states: State[];
    GotoTable: Map<string, number>[];
    ActionTable: Map<string, { action: "shift" | "reduce"; value: number }>[];
  }> {
    const initialState = { ..._initialState, count: 0 };
    // Create a list of states to be returned and another list of states that have not been vistited
    const states = [initialState] as State[];
    const unprocessedStates = [initialState] as State[];

    // array of maps whose keys is a variable and the value are the state to goto next
    const GotoTable = [] as Map<string, number>[];
    // array of maps whose keys is a terminal is a value of either to shift or reduce
    const ActionTable = [] as Map<string, { action: "shift" | "reduce"; value: number }>[];

    // While there is an unprocessed state, visit it
    while (unprocessedStates.length > 0) {
      const currentState = unprocessedStates.shift()!;
      const nextStates_Goto = new Map<string, Item[]>();
      const nextStates_Shift = new Map<string, Item[]>();

      // determine transitions out of the current state by iterating
      // through all the items in the item set of the state
      calculateNextItem: for (const item of currentState.itemSet) {
        // check next symbol after the dot
        const nextSymbol = item.rhs[item.dot];

        // no next symbol is available, therefore we need to create a reduction
        if (nextSymbol == null) {
          // Find the prodction that this item reduces to using the symbols on its right hand side
          // TODO: check if the find can fail, honestly this might be invariant
          const productionToReduceTo = productions
            .map((p, i) => [p, i] as const)
            .find(
              ([p, _]) => JSON.stringify(p.rhs) === JSON.stringify(item.rhs) && p.identifier === item.identifier,
            )![1];

          // for each lookahead in the item, create a new entry in the action table to reduce to the production found
          for (const lookahead of item.lookahead) {
            if (ActionTable[currentState.count] === undefined) ActionTable[currentState.count] = new Map();
            ActionTable[currentState.count]!.set(lookahead, { action: "reduce", value: productionToReduceTo });
          }

          continue calculateNextItem;
        }

        // Create the next item by shifting the dot by 1 place
        const newItem: Item = { ...item, dot: item.dot + 1 };

        // Determine if we're going to create a GOTO or SHIFT based on the type of the symbol after the dot
        if (nextSymbol.type === "variable") {
          // Next symbol is a variable so we need to add it to the GOTO table
          // Check if the GOTO table already has an entry for the next symbola and either push or create the array
          if (nextStates_Goto.has(nextSymbol.identifier)) nextStates_Goto.get(nextSymbol.identifier)!.push(newItem);
          else nextStates_Goto.set(nextSymbol.identifier, [newItem]);
        } else if (nextSymbol.type === "terminal") {
          // Next symbol is a terminal so we need to add it to the SHIFT table
          // Check if the SHIFT table already has an entry for the next symbola and either push or create the array
          if (nextStates_Shift.has(nextSymbol.identifier)) nextStates_Shift.get(nextSymbol.identifier)!.push(newItem);
          else nextStates_Shift.set(nextSymbol.identifier, [newItem]);
        }
      }

      // For each GOTO transition from the current state, expand  the item set that it points to
      // and check if a state exist with the same itemset already exists
      // If it doesn't exist, create a new state and add it to the list of states
      // Add the existing / created state to the GOTO table
      for (const [gotoTransition, gotoItems] of nextStates_Goto.entries()) {
        const expandedItemsResult = expandItemSet(gotoItems);
        if (expandedItemsResult.success === false) return expandedItemsResult;
        const expandedItems = expandedItemsResult.value;

        // check if a state exist with the same item sets
        let existingState = states.find((s) => {
          return (
            s.kernel.lhs === expandedItems.kernel.lhs &&
            s.kernel.rhs.length === expandedItems.kernel.rhs.length &&
            JSON.stringify(s.kernel.rhs) === JSON.stringify(expandedItems.kernel.rhs) &&
            s.kernel.lookahead.length === expandedItems.kernel.lookahead.length &&
            JSON.stringify(s.kernel.lookahead) === JSON.stringify(expandedItems.kernel.lookahead) &&
            JSON.stringify(s.itemSet) === JSON.stringify(expandedItems.itemSet)
          );
        });

        if (GotoTable[currentState.count] === undefined) GotoTable[currentState.count] = new Map();
        if (existingState == undefined) {
          const newState: State = {
            itemSet: expandedItems.itemSet,
            kernel: expandedItems.kernel,
            count: states.length,
          };
          states.push(newState);
          unprocessedStates.push(newState);
          existingState = newState;
        }

        GotoTable[currentState.count]!.set(gotoTransition, existingState.count);
      }

      // For each SHIFT transition from the current state, expand  the item set that it points to
      // and check if a state exist with the same itemset already exists
      // If it doesn't exist, create a new state and add it to the list of states
      // Add the existing / created state to the SHIFT table
      for (const [shiftTransition, shiftItems] of nextStates_Shift.entries()) {
        const expandedItemsResult = expandItemSet(shiftItems);
        if (expandedItemsResult.success === false) return expandedItemsResult;
        const expandedItems = expandedItemsResult.value;

        // check if a state exist with the same item sets
        let existingState = states.find((s) => {
          return (
            s.kernel.lhs === expandedItems.kernel.lhs &&
            s.kernel.rhs.length === expandedItems.kernel.rhs.length &&
            JSON.stringify(s.kernel.rhs) === JSON.stringify(expandedItems.kernel.rhs) &&
            s.kernel.lookahead.length === expandedItems.kernel.lookahead.length &&
            JSON.stringify(s.kernel.lookahead) === JSON.stringify(expandedItems.kernel.lookahead) &&
            JSON.stringify(s.itemSet) === JSON.stringify(expandedItems.itemSet)
          );
        });

        // If there is no entry in the ActionTable for the current state, create one
        if (ActionTable[currentState.count] === undefined) ActionTable[currentState.count] = new Map();

        // If no such state exists, create a new state and add it to the list of states
        if (existingState == undefined) {
          const newState: State = {
            itemSet: expandedItems.itemSet,
            kernel: expandedItems.kernel,
            count: states.length,
          };
          states.push(newState);
          unprocessedStates.push(newState);
          existingState = newState;
        }

        ActionTable[currentState.count]!.set(shiftTransition, { action: "shift", value: existingState.count });
      }
    }

    // return the set of states, the GOTO table and the ACTION table
    return { success: true, value: { states, GotoTable, ActionTable } };
  }

  const StatesResult = generateStates(initialItemSet);
  if (StatesResult.success === false) return StatesResult;
  const { states, ActionTable, GotoTable } = StatesResult.value;
  return { success: true, value: new GeneratorResult(states, ActionTable, GotoTable) };
};

export class GeneratorResult {
  constructor(
    public readonly states: State[],
    public readonly ActionTable: Map<string, { action: "shift" | "reduce"; value: number }>[],
    public readonly GotoTable: Map<string, number>[],
  ) {}

  toTable(): string {
    return this.ActionTable.map((actions, idx) => {
      return [
        ...[...actions.entries()].map(([k, { action, value }]) => `${k}=${action === "reduce" ? "r" : "s"}${value}`),
        ...(this.GotoTable[idx] === undefined ? [] : [...this.GotoTable[idx].entries()].map(([k, v]) => `${k}=${v}`)),
      ].join(", ");
    }).join("\n");
  }

  toStates(): TableState[] {
    return this.ActionTable.map((actions, idx) => {
      const tableState = new TableState();

      for (const [k, { action, value }] of actions.entries())
        tableState.actions.set(k, { type: action === "reduce" ? "reduce" : "shift", value });

      if (this.GotoTable[idx] !== undefined)
        for (const [k, value] of this.GotoTable[idx].entries()) tableState.actions.set(k, { type: "goto", value });

      return tableState;
    });
  }

  toJSObject() {
    return this.toStates().map((tableState) => tableState.toJSObject());
  }
}
