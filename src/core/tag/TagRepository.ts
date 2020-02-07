import { Tag } from './Tag';

export interface TagRepository {
  getById(tagId: Tag['id']): Tag;
  getAll(): Tag[];
  findByName(name: Tag['name']): Tag | undefined;
  save(tag: Tag): void;
}
