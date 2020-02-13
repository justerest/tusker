import { Identity } from '../common/Identity';
import { assert } from 'src/utils/assert';
import { TagRepository } from './TagRepository';

export class Tag {
  static createTag(name: string, tagRepository: TagRepository): Tag {
    assert(!tagRepository.findByName(name), 'Tag name already used');
    const tag = new Tag();
    tag.id = name;
    tag.name = name;
    return tag;
  }

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
