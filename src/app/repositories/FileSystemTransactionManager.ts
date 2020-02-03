import { Subject } from 'rxjs';
import { assert } from 'src/utils/assert';

export class FileSystemTransactionManager {
  static instance = new FileSystemTransactionManager();

  private transactionStarted = false;

  private constructor() {}

  transactionStarted$ = new Subject();
  transactionCommitted$ = new Subject();

  startTransaction(): void {
    assert(!this.transactionStarted, 'Transaction already started');
    this.transactionStarted = true;
    this.transactionStarted$.next();
  }

  commitTransaction(): void {
    assert(this.transactionStarted, 'Transaction not started yet');
    this.transactionStarted = false;
    this.transactionCommitted$.next();
  }
}

export function Transactional(): MethodDecorator {
  return (_, __, descriptor) => {
    const fn = (descriptor.value as unknown) as (...args: any[]) => any;
    return {
      ...descriptor,
      value(...args: any[]) {
        FileSystemTransactionManager.instance.startTransaction();
        const result = fn.apply(this, args);
        FileSystemTransactionManager.instance.commitTransaction();
        return result;
      },
    } as any;
  };
}
