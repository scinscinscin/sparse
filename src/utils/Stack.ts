export class Stack<T> {
  private items: T[] = [];

  public push(item: T) {
    this.items.push(item);
  }

  public pop(): T {
    const item = this.items.pop();
    if (item === undefined) throw new Error("Stack is empty");
    return item;
  }

  public peek(): T {
    const ret = this.items[this.items.length - 1];
    if (ret === undefined) throw new Error("Stack is empty");
    return ret;
  }

  /** Reads `depth` items below the top of the stack. Depth 0 is the top. */
  public peekAt(depth: number): T {
    const ret = this.items[this.items.length - 1 - depth];
    if (ret === undefined) throw new Error(`Stack does not have an item at depth ${depth}`);
    return ret;
  }

  public get size() {
    return this.items.length;
  }

  public get isEmpty() {
    return this.items.length === 0;
  }

  /** A copy of the stack, bottom first. Useful for error reporting inside a recovery function. */
  public toArray(): T[] {
    return [...this.items];
  }

  constructor(items: T[] = []) {
    this.items = [...items];
  }
}