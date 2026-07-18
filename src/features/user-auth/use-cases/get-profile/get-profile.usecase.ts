import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/entity/user.entity';
import { ProfileResponse, UserMapper } from 'src/libs/Mapper/UserMapper';
import { Repository } from 'typeorm';

@Injectable()
export class GetProfileUseCase {
  private readonly logger: Logger = new Logger(GetProfileUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async execute(userId: string): Promise<ProfileResponse> {
    const user: User | null = await this.userRepository.findOne({
      where: { userId },
      relations: ['userRoles', 'jobseekerProfile'],
    });
    if (!user) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new NotFoundException('User tidak ditemukan');
    }

    return UserMapper.toProfileResponse(user);
  }
}
