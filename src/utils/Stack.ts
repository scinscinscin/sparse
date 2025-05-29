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

  constructor(items: T[] = []) {
    this.items = items;
  }
}
