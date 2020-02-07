import { FileSystemRepository } from './FileSystemRepository';
import { TagRepository } from 'src/core/tag/TagRepository';
import { Tag } from 'src/core/tag/Tag';

export class FileSystemTagRepository extends FileSystemRepository<Tag> implements TagRepository {
  protected entityName = Tag.name;
  protected serialize = Tag.serialize;
  protected deserialize = Tag.deserialize;

  findByName(name: string): Tag | undefined {
    return this.getAll().find((tag) => tag.name === name);
  }
}
