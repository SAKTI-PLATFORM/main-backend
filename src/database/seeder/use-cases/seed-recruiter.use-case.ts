import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import { EntityManager } from 'typeorm';
import { ISeederUseCase } from './abstract-seeder-usecase';

interface RecruiterConfig {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class SeedRecruiterUseCase extends ISeederUseCase {
  private readonly logger = new Logger(SeedRecruiterUseCase.name);

  private readonly devRecruiters: RecruiterConfig[] = [
    {
      name: 'Demo Recruiter',
      email: 'demo.recruiter@example.com',
      password: 'recruiter123',
    },
  ];

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async execute(manager: EntityManager): Promise<void> {
    const name = this.configService.get<string>('SEED_RECRUITER_NAME');
    const email = this.configService.get<string>('SEED_RECRUITER_EMAIL');
    const password = this.configService.get<string>('SEED_RECRUITER_PASSWORD');

    if (name && email && password) {
      await this.seedRecruiter(manager, { name, email, password });
    } else {
      this.logger.warn(
        'SEED_RECRUITER_* not configured. Seeding default dev recruiters.',
      );
      for (const recruiter of this.devRecruiters) {
        await this.seedRecruiter(manager, recruiter);
      }
    }
  }

  async clear(manager: EntityManager): Promise<void> {
    this.logger.log('Clearing recruiter data...');
    await this.truncate(manager);
  }

  async truncate(manager: EntityManager): Promise<void> {
    this.logger.log('Truncating users and user_roles tables...');

    await manager.query('SET FOREIGN_KEY_CHECKS = 0');
    await manager.query('TRUNCATE TABLE `user_roles`');
    await manager.query('TRUNCATE TABLE `users`');
    await manager.query('SET FOREIGN_KEY_CHECKS = 1');

    this.logger.log('Users and user_roles tables truncated successfully');
  }

  private async seedRecruiter(
    manager: EntityManager,
    config: RecruiterConfig,
  ): Promise<void> {
    const existingUser = await manager.findOne(User, {
      where: { email: config.email },
    });

    if (existingUser) {
      this.logger.log(`Recruiter "${config.name}" already exists, skipping...`);
      return;
    }

    const hashedPassword = await PasswordHasher.hash(config.password);
    const user = manager.create(User, {
      username: config.name,
      email: config.email,
      hashedPassword,
    });

    const savedUser = await manager.save(user);
    this.logger.log(`Recruiter user "${config.name}" created`);

    const role = manager.create(UserRole, {
      userId: savedUser.id,
      roleName: UserRoleEnum.RECRUITER,
    });

    await manager.save(role);
    this.logger.log(`RECRUITER role assigned to "${config.name}"`);
  }
}
