import { TagRepository } from './TagRepository';
import { Tag } from './Tag';
import { assert } from 'src/utils/assert';

export class TagService {
  constructor(private tagRepository: TagRepository) {}

  createTag(name: string): Tag {
    assert(!this.tagRepository.findByName(name), 'Tag name already used');
    const tag = new Tag();
    tag.id = name;
    tag.name = name;
    return tag;
  }
}
