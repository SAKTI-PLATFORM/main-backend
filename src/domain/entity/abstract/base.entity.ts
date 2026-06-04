import { BeforeInsert, PrimaryColumn } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { ITimestamp } from './timestamp.entity';

/**
 * Base for entities keyed by a time-ordered UUIDv7, with created/updated
 * timestamps. Centralises id generation so individual entities don't repeat it.
 */
export abstract class BaseEntity extends ITimestamp {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  protected generateId(): void {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
