import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { User } from 'src/domain/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogoutUseCase {
  private readonly logger: Logger = new Logger(LogoutUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async execute(currentUser: ICurrentUser): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!user) {
      this.logger.warn(`User not found with ID: ${currentUser.id}`);
      throw new NotFoundException('User tidak ditemukan');
    }

    if (!user.activeToken) {
      this.logger.warn(`User ${currentUser.id} has no active token`);
      throw new UnauthorizedException(
        'Tidak ada sesi aktif ditemukan atau anda sudah logout sebelumnya',
      );
    }

    user.activeToken = null;
    await this.userRepository.save(user);

    this.logger.log(`User ${currentUser.id} logged out successfully`);
  }
}
