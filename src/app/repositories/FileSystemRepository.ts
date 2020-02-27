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

  private transactionStarted = false;
  private hasChanges = false;
  private cache?: T[];

  constructor() {
    FileSystemTransactionManager.instance.transactionStarted$.subscribe(
      () => (this.transactionStarted = true),
    );
    FileSystemTransactionManager.instance.transactionCommitted$.subscribe(() => {
      if (this.hasChanges) {
        assert(this.cache, 'No cache');
        writeJSONSync(this.filePath, this.cache.map(this.serialize));
        this.hasChanges = false;
      }
      this.transactionStarted = false;
      this.cache = undefined;
    });
    FileSystemTransactionManager.instance.transactionAborted$.subscribe(() => {
      this.transactionStarted = false;
      this.hasChanges = false;
      this.cache = undefined;
    });
  }

  getById(id: T['id']): T {
    const entity = this.getAll().find((el) => Identity.equals(el.id, id));
    assert(entity, `${this.entityName} not found`);
    return entity;
  }

  getAll(): T[] {
    this.resolveCache();
    return this.cache || this.getData();
  }

  private resolveCache() {
    if (this.transactionStarted && !this.cache) {
      this.cache = this.getData();
    }
  }

  private getData(): T[] {
    if (!existsSync(this.filePath)) {
      ensureFileSync(this.filePath);
      writeJSONSync(this.filePath, []);
    }
    return (readJSONSync(this.filePath) as unknown[]).map(this.deserialize);
  }

  save(entity: T): void {
    this.resolveCache();
    assert(this.cache, 'No cache');
    this.hasChanges = true;
    const entities = this.cache;
    const index = entities.findIndex((t) => this.equals(t, entity));
    if (index === -1) {
      entities.push(entity);
    } else {
      entities.splice(index, 1, entity);
    }
  }

  protected equals(entity1: T, entity2: T): unknown {
    return Identity.equals(entity1.id, entity2.id);
  }
}
