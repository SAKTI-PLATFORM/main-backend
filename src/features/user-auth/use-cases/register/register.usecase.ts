import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { AuthService } from 'src/auth/auth.service';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './register.dto';

@Injectable()
export class RegisterUseCase {
  private readonly logger: Logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject()
    private readonly authService: AuthService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async execute(dto: RegisterDto): Promise<IAuthToken> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const user = await User.create({
      email: dto.email,
      password: dto.password,
      confirmationPassword: dto.confirmationPassword,
      username: dto.fullName,
    });

    const userRole = new UserRole();
    userRole.roleName = dto.role;
    user.userRoles = [userRole];

    await this.userRepository.save(user);

    this.logger.log(`New user registered: ${user.email} as ${dto.role}`);

    const currentUser: ICurrentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: [dto.role],
      uniqueKey: randomUUID(),
    };

    const token: string = this.authService.generateJwtToken(currentUser);
    user.activeToken = token;
    await this.userRepository.save(user);

    return { token };
  }
}
