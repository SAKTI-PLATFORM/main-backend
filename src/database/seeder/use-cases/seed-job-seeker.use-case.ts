import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import { EntityManager } from 'typeorm';
import { ISeederUseCase } from './abstract-seeder-usecase';

@Injectable()
export class SeedJobSeekerUseCase extends ISeederUseCase {
  private readonly logger = new Logger(SeedJobSeekerUseCase.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async execute(manager: EntityManager): Promise<void> {
    const name = this.configService.get<string>('SEED_JOB_SEEKER_NAME');
    const email = this.configService.get<string>('SEED_JOB_SEEKER_EMAIL');
    const password = this.configService.get<string>('SEED_JOB_SEEKER_PASSWORD');

    if (!name || !email || !password) {
      this.logger.warn(
        'SEED_JOB_SEEKER_NAME, SEED_JOB_SEEKER_EMAIL, or SEED_JOB_SEEKER_PASSWORD not configured. Skipping job seeker seeding.',
      );
      return;
    }

    const existingUser = await manager.findOne(User, { where: { email } });
    if (existingUser) {
      this.logger.log('Job seeker user already exists, skipping...');
      return;
    }

    const hashedPassword = await PasswordHasher.hash(password);
    const user = manager.create(User, {
      username: name,
      email,
      hashedPassword,
    });
    const savedUser = await manager.save(user);
    this.logger.log(`Job seeker user "${name}" created`);

    const role = manager.create(UserRole, {
      userId: savedUser.id,
      roleName: UserRoleEnum.JOB_SEEKER,
    });
    await manager.save(role);
    this.logger.log(`JOB_SEEKER role assigned to "${name}"`);
  }

  async clear(manager: EntityManager): Promise<void> {
    this.logger.log('Clearing job seeker data...');
    await this.truncate(manager);
  }

  async truncate(manager: EntityManager): Promise<void> {
    this.logger.log('Truncating users and user_roles tables...');

    await manager.query('SET FOREIGN_KEY_CHECKS = 0');
    await manager.query('TRUNCATE TABLE `user_roles`');
    this.logger.log('Table user_roles truncated');
    await manager.query('TRUNCATE TABLE `users`');
    this.logger.log('Table users truncated');
    await manager.query('SET FOREIGN_KEY_CHECKS = 1');

    this.logger.log('Users and user_roles tables truncated successfully');
  }
}
