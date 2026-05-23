import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import {
  GetProfileUseCase,
  GoogleAuthUseCase,
  LoginUseCase,
  LogoutUseCase,
  RegisterUseCase,
} from './use-cases';
import { UserAuthController } from './user-auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole]), AuthModule],
  controllers: [UserAuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    GoogleAuthUseCase,
    GetProfileUseCase,
    LogoutUseCase,
  ],
})
export class UserAuthModule {}
