import { GrammarToken, Production } from "./meta/common";

export type GrammarError = { reason: string; token: GrammarToken };

export const checkGrammar = (productions: Production[]): GrammarError[] => {
  const errors: GrammarError[] = [];
  const emit_error = (err: GrammarError) => {
    const has = errors.some((x) => JSON.stringify(x) === JSON.stringify(err));
    if (!has) errors.push(err);
  };

  const validProductionNames = new Set<string>();
  for (const p of productions) validProductionNames.add(p.identifier);

  // Check 1: references to non-existent productions
  for (const p of productions)
    for (const rhs of p.rhs)
      if (rhs.type === "variable" && !validProductionNames.has(rhs.identifier))
        emit_error({
          reason: `Variable "${rhs.identifier}" doesn't have a corresponding left hand side`,
          token: rhs.token,
        });

  // Check 2: cycles of single-variable productions (e.g. A -> B, B -> A) that can loop without consuming input
  const singleVariable = new Map<string, { target: string; production: Production }[]>();
  for (const p of productions)
    if (p.rhs.length === 1 && p.rhs[0].type === "variable") {
      const list = singleVariable.get(p.identifier) ?? [];
      list.push({ target: p.rhs[0].identifier, production: p });
      singleVariable.set(p.identifier, list);
    }

  const findPath = (from: string, to: string): string[] | null => {
    const visited = new Set<string>();

    const dfs = (node: string, path: string[]): string[] | null => {
      if (node === to) return path;
      if (visited.has(node)) return null;
      visited.add(node);

      for (const { target } of singleVariable.get(node) ?? []) {
        const result = dfs(target, [...path, target]);
        if (result) return result;
      }

      return null;
    };

    return dfs(from, [from]);
  };

  for (const [source, edges] of singleVariable)
    for (const { target, production } of edges) {
      const path = findPath(target, source);
      if (path)
        emit_error({
          reason: `Production "${source}" -> "${target}" is part of a cycle (${source} -> ${path.join(
            " -> ",
          )}) that can loop without consuming input`,
          token: production.rhs[0].token,
        });
    }

  return errors;
};
