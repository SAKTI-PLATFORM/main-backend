import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { Repository } from 'typeorm';
import {
  AUTH_REQUEST_USER_KEY,
  AuthDecoratorEnum,
  AuthRoleEnum,
} from '../enums/auth.enum';
import { ICurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: string[] = this.reflector.getAllAndOverride<string[]>(
      AuthDecoratorEnum.ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request: Request = context.switchToHttp().getRequest<Request>();

    const authHeader: string | undefined = request.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException(
        'UNAUTHORIZED: Missing authorization header',
      );
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('UNAUTHORIZED: Invalid bearer token');
    }

    let user: ICurrentUser | null;
    try {
      user = this.authService.verifyJwtToken(token);
    } catch {
      throw new UnauthorizedException('UNAUTHORIZED: Invalid token');
    }
    if (!user) {
      throw new UnauthorizedException(
        'UNAUTHORIZED: Invalid token verification',
      );
    }

    request[AUTH_REQUEST_USER_KEY] = user;

    const userExists = await this.userRepository.exists({
      where: { userId: user.userId },
    });
    if (!userExists) {
      throw new UnauthorizedException('UNAUTHORIZED: User tidak ditemukan');
    }

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(AuthRoleEnum.ANY)) {
        if (
          !requiredRoles.some((role) =>
            user.roles.includes(role as UserRoleEnum),
          )
        ) {
          throw new UnauthorizedException(
            'UNAUTHORIZED: User tidak punya akses role yang sesuai',
          );
        }
      }
    }

    return true;
  }
}
