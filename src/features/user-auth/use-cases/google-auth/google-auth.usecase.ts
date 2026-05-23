import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'node:crypto';
import { AuthService } from 'src/auth/auth.service';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { Repository } from 'typeorm';
import { GoogleAuthDto } from './google-auth.dto';

@Injectable()
export class GoogleAuthUseCase {
  private readonly logger: Logger = new Logger(GoogleAuthUseCase.name);
  private readonly oauthClient: OAuth2Client;

  constructor(
    @Inject()
    private readonly authService: AuthService,

    @Inject()
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const clientId = this.configService.get<string>('app.google.clientId');
    this.oauthClient = new OAuth2Client(clientId);
  }

  public async execute(dto: GoogleAuthDto): Promise<IAuthToken> {
    const clientId = this.configService.get<string>('app.google.clientId');

    let googlePayload: { sub: string; email: string; name: string };
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token Google tidak valid');
      }
      googlePayload = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0],
      };
    } catch {
      throw new UnauthorizedException(
        'Token Google tidak valid atau sudah kadaluarsa',
      );
    }

    let user = await this.userRepository.findOne({
      where: [{ googleId: googlePayload.sub }, { email: googlePayload.email }],
      relations: ['userRoles'],
    });

    if (!user) {
      if (!dto.role) {
        throw new BadRequestException(
          'Role diperlukan untuk mendaftarkan akun baru via Google',
        );
      }

      user = User.createWithGoogle({
        email: googlePayload.email,
        googleId: googlePayload.sub,
        username: googlePayload.name,
      });

      const userRole = new UserRole();
      userRole.roleName = dto.role;
      user.userRoles = [userRole];

      await this.userRepository.save(user);
      this.logger.log(
        `New user registered via Google: ${user.email} as ${dto.role}`,
      );
    } else {
      if (!user.googleId) {
        user.googleId = googlePayload.sub;
      }
    }

    const currentUser: ICurrentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.userRoles.map((role) => role.roleName),
      uniqueKey: randomUUID(),
    };

    const token: string = this.authService.generateJwtToken(currentUser);
    user.activeToken = token;
    await this.userRepository.save(user);

    return { token };
  }
}
