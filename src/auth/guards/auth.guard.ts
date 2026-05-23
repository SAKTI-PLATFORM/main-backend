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
    const token: string = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('UNAUTHORIZED: Missing token');

    const isTokenExistInDb: boolean = await this.userRepository
      .createQueryBuilder('user')
      .where('user.active_token = :token', { token: token })
      .getCount()
      .then((count: number) => count > 0);
    if (!isTokenExistInDb) {
      throw new UnauthorizedException('UNAUTHORIZED: Token not recognized');
    }

    const user: ICurrentUser | null = this.authService.verifyJwtToken(token);
    if (!user) {
      throw new UnauthorizedException(
        'UNAUTHORIZED: Invalid token verification',
      );
    }

    request[AUTH_REQUEST_USER_KEY] = user;

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
