import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { ICurrentUser } from './interfaces/current-user.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  public generateJwtToken(payload: ICurrentUser): string {
    const uniqueKey: string = randomUUID();
    payload.uniqueKey = uniqueKey;

    return this.jwtService.sign(payload);
  }

  public verifyJwtToken(token: string): ICurrentUser {
    return this.jwtService.verify<ICurrentUser>(token);
  }
}
