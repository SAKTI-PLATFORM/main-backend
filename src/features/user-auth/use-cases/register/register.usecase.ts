import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { AuthService } from 'src/auth/auth.service';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { JobseekerProfile } from 'src/domain/entity/jobseeker-profile.entity';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
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
      fullName: dto.fullName,
    });

    const userRole = new UserRole();
    userRole.role = dto.role;
    user.userRoles = [userRole];

    if (dto.role === UserRoleEnum.JOB_SEEKER) {
      const profile = new JobseekerProfile();
      profile.user = user;
      user.jobseekerProfile = profile;
    }

    await this.userRepository.save(user);

    this.logger.log(`New user registered: ${user.email} as ${dto.role}`);

    const currentUser: ICurrentUser = {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      roles: [dto.role],
      uniqueKey: randomUUID(),
    };

    const token: string = this.authService.generateJwtToken(currentUser);
    return { token };
  }
}
