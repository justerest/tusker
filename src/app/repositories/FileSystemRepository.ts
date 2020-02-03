import { Identity } from 'src/core/common/Identity';
import { resolve } from 'path';
import { existsSync, ensureFileSync, writeJSONSync, readJSONSync } from 'fs-extra';
import { assert } from 'src/utils/assert';
import { FileSystemTransactionManager } from './FileSystemTransactionManager';

export abstract class FileSystemRepository<T extends { id: Identity }> {
  protected abstract entityName: string;
  protected abstract serialize: (entity: T) => any;
  protected abstract deserialize: (...args: any[]) => T;

  private get filePath(): string {
    return resolve(process.cwd(), `db/${this.entityName}.json`);
  }

  constructor() {
    FileSystemTransactionManager.instance.transactionStarted$.subscribe(
      () => (this.cache = this.resolveCache()),
    );
    FileSystemTransactionManager.instance.transactionCommitted$.subscribe(() => {
      assert(this.cache, 'No cache');
      writeJSONSync(this.filePath, this.cache.map(this.serialize));
      this.cache = undefined;
    });
    FileSystemTransactionManager.instance.transactionAborted$.subscribe(() => {
      assert(this.cache, 'No cache');
      this.cache = undefined;
    });
  }

  private cache?: T[];

  getById(id: T['id']): T {
    const entity = this.getAll().find((el) => Identity.equals(el.id, id));
    assert(entity, `${this.entityName} not found`);
    return entity;
  }

  getAll(): T[] {
    return this.cache || this.resolveCache();
  }

  private resolveCache(): T[] {
    if (!existsSync(this.filePath)) {
      ensureFileSync(this.filePath);
      writeJSONSync(this.filePath, []);
    }
    return (readJSONSync(this.filePath) as unknown[]).map(this.deserialize);
  }

  save(entity: T): void {
    assert(this.cache, 'No cache');
    const entities = this.cache;
    const index = entities.findIndex((t) => Identity.equals(t.id, entity.id));
    if (index === -1) {
      entities.push(entity);
    } else {
      entities.splice(index, 1, entity);
    }
  }
}
