import { Identity } from '../common/Identity';

export class Tag {
  static serialize(tag: Tag): unknown {
    return { ...tag };
  }

  static deserialize(tagSnapshot: any): Tag {
    return Object.assign(new Tag(), tagSnapshot);
  }

  id: Identity = Identity.generate();
  name!: string;

  constructor() {}
}
