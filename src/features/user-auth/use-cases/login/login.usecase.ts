import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { AuthService } from 'src/auth/auth.service';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { User } from 'src/domain/entity/user.entity';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import { Repository } from 'typeorm';
import { LoginDto } from './login.dto';

@Injectable()
export class LoginUseCase {
  private readonly logger: Logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject()
    private readonly authService: AuthService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async execute(dto: LoginDto): Promise<IAuthToken> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.trim().toLowerCase() },
      relations: ['userRoles'],
    });

    if (!user) {
      this.logger.warn(`User not found with email: ${dto.email}`);
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Akun ini terdaftar melalui Google. Silakan login dengan Google.',
      );
    }

    const isValidPassword: boolean = await PasswordHasher.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isValidPassword) {
      this.logger.warn(`Invalid password attempt for email: ${user.email}`);
      throw new UnauthorizedException('Email atau password salah');
    }

    const currentUser: ICurrentUser = {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      roles: user.userRoles.map((role) => role.role),
      uniqueKey: randomUUID(),
    };

    const token: string = this.authService.generateJwtToken(currentUser);
    return { token };
  }
}
