export interface Identity {
  toString(): string;
}

export class Identity {
  static equals(id1: Identity, id2: Identity | undefined): boolean {
    return id1.toString() === id2?.toString();
  }

  static generate(): Identity {
    return Math.random();
  }

  static primary(id: Identity): Identity {
    const numberId = Number.parseFloat(`${id}`);
    return `${numberId}` === id ? numberId : id;
  }

  private constructor() {}
}
