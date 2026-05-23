import { EntityManager } from 'typeorm';

export abstract class ISeederUseCase {
  abstract execute(manager: EntityManager): Promise<void>;
  abstract clear(manager: EntityManager): Promise<void>;
  abstract truncate(manager: EntityManager): Promise<void>;
}
