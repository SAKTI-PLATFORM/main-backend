import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import { EntityManager } from 'typeorm';
import { uuidv7 } from 'uuidv7';
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
    this.logger.log('Truncating user and user_role tables...');

    await manager.query('SET FOREIGN_KEY_CHECKS = 0');
    await manager.query('TRUNCATE TABLE `user_role`');
    await manager.query('TRUNCATE TABLE `user`');
    await manager.query('SET FOREIGN_KEY_CHECKS = 1');

    this.logger.log('User and user_role tables truncated successfully');
  }

  private async seedRecruiter(
    manager: EntityManager,
    config: RecruiterConfig,
  ): Promise<void> {
    const userRepository = manager.getRepository(User);
    const userRoleRepository = manager.getRepository(UserRole);

    const existingUser = await userRepository.findOne({
      where: { email: config.email },
    });

    if (existingUser) {
      this.logger.log(`Recruiter "${config.name}" already exists, skipping...`);
      return;
    }

    const passwordHash = await PasswordHasher.hash(config.password);
    const userId = uuidv7();
    const user = userRepository.create({
      userId,
      fullName: config.name,
      email: config.email,
      passwordHash,
    });

    await userRepository.save(user);
    this.logger.log(`Recruiter user "${config.name}" created`);

    const role = userRoleRepository.create({
      userId,
      role: UserRoleEnum.RECRUITER,
    });

    await userRoleRepository.save(role);
    this.logger.log(`RECRUITER role assigned to "${config.name}"`);
  }
}
