import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/entity/user.entity';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: {
          algorithm: 'HS512',
          expiresIn: configService.get('app.jwt.expires') || '7d',
        },
      }),
    }),

    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService],
  // Re-export the User repository so any module importing AuthModule (i.e. using
  // AuthGuard) can resolve @InjectRepository(User) without repeating forFeature.
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
