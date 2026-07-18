import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobseekerProfile } from 'src/domain/entity/jobseeker-profile.entity';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import { EntityManager } from 'typeorm';
import { uuidv7 } from 'uuidv7';
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

    const userRepository = manager.getRepository(User);
    const userRoleRepository = manager.getRepository(UserRole);
    const profileRepository = manager.getRepository(JobseekerProfile);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      this.logger.log('Job seeker user already exists, skipping...');
      return;
    }

    const passwordHash = await PasswordHasher.hash(password);
    const userId = uuidv7();
    const user = userRepository.create({
      userId,
      fullName: name,
      email,
      passwordHash,
    });
    await userRepository.save(user);
    this.logger.log(`Job seeker user "${name}" created`);

    const role = userRoleRepository.create({
      userId,
      role: UserRoleEnum.JOB_SEEKER,
    });
    await userRoleRepository.save(role);
    await profileRepository.save(profileRepository.create({ userId }));
    this.logger.log(`JOB_SEEKER role assigned to "${name}"`);
  }

  async clear(manager: EntityManager): Promise<void> {
    this.logger.log('Clearing job seeker data...');
    await this.truncate(manager);
  }

  async truncate(manager: EntityManager): Promise<void> {
    this.logger.log('Truncating user and user_role tables...');

    await manager.query('SET FOREIGN_KEY_CHECKS = 0');
    await manager.query('TRUNCATE TABLE `user_role`');
    this.logger.log('Table user_role truncated');
    await manager.query('TRUNCATE TABLE `user`');
    this.logger.log('Table user truncated');
    await manager.query('SET FOREIGN_KEY_CHECKS = 1');

    this.logger.log('User and user_role tables truncated successfully');
  }
}
