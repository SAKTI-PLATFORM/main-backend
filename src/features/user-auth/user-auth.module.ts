import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { JobseekerProfile } from 'src/domain/entity/jobseeker-profile.entity';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import {
  GetProfileUseCase,
  GoogleAuthUseCase,
  LoginUseCase,
  RegisterUseCase,
} from './use-cases';
import { UserAuthController } from './user-auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, JobseekerProfile]),
    AuthModule,
  ],
  controllers: [UserAuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    GoogleAuthUseCase,
    GetProfileUseCase,
  ],
})
export class UserAuthModule {}
