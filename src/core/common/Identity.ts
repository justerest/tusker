export interface Identity {
  toString(): string;
}

export class Identity {
  static equals(id1: Identity, id2: Identity | undefined): boolean {
    return id1.toString() === id2?.toString();
  }

  static random(): Identity {
    return Math.random();
  }

  private constructor() {}
}
