/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeedJobSeekerUseCase } from './use-cases/seed-job-seeker.use-case';
import { SeedRecruiterUseCase } from './use-cases/seed-recruiter.use-case';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly seedJobSeekerUseCase: SeedJobSeekerUseCase,
    private readonly seedRecruiterUseCase: SeedRecruiterUseCase,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting database seeding...');

    await this.dataSource.transaction(async (manager) => {
      await this.seedJobSeekerUseCase.execute(manager);
      if (process.env.NODE_ENV !== 'production') {
        await this.seedRecruiterUseCase.execute(manager);
      } else {
        this.logger.log('Skipping development seeders in production environment.');
      }
    });

    this.logger.log('Database seeding completed successfully!');
  }

  async clear(): Promise<void> {
    this.logger.warn('Clearing all database tables...');

    await this.dataSource.transaction(async (manager) => {
      await manager.query('SET FOREIGN_KEY_CHECKS = 0');

      const tables = (await manager.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()`,
      )) as Array<{ TABLE_NAME?: string; table_name?: string }>;

      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name;
        if (tableName !== 'migrations' && tableName !== 'typeorm_metadata') {
          await manager.query(`TRUNCATE TABLE \`${tableName}\``);
        }
      }

      await manager.query('SET FOREIGN_KEY_CHECKS = 1');
    });

    this.logger.log('All database tables cleared successfully!');
  }

  async reset(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.error('Reset operation is not allowed in production environment.');
      return;
    }
    await this.clear();
    await this.seed();
  }

  async truncate(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.error('Truncate operation is not allowed in production environment.');
      return;
    }

    this.logger.warn('Truncating all tables in the database...');

    await this.dataSource.transaction(async (manager) => {
      await manager.query('SET FOREIGN_KEY_CHECKS = 0');

      const tables = (await manager.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()`,
      )) as Array<{ TABLE_NAME?: string; table_name?: string }>;

      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name;
        if (tableName !== 'migrations' && tableName !== 'typeorm_metadata') {
          await manager.query(`TRUNCATE TABLE \`${tableName}\``);
        }
      }

      await manager.query('SET FOREIGN_KEY_CHECKS = 1');
    });

    this.logger.log('All tables truncated successfully!');
  }
}
