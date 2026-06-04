import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { SeekerCareerModule } from './features/seeker-career/seeker-career.module';
import { SeekerDashboardModule } from './features/seeker-dashboard/seeker-dashboard.module';
import { SeekerOnboardingModule } from './features/seeker-onboarding/seeker-onboarding.module';
import { UserAuthModule } from './features/user-auth/user-auth.module';
import app from './infrastructure/config/app/app.config';
import { dataSourceOptions } from './infrastructure/config/database/typeorm.config';
import environmentValidation from './infrastructure/config/environment.validation';
import { createPinoLoggerOptions } from './infrastructure/core/logger/pino-logger.factory';
import { MicroservicesModule } from './infrastructure/microservices/microservices.module';
import { SaktiAiModule } from './infrastructure/sakti-ai/sakti-ai.module';

const env: string = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${env}`,
      load: [app],
      validationSchema: environmentValidation,
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createPinoLoggerOptions(config),
    }),

    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),

    SaktiAiModule,
    MicroservicesModule,
    UserAuthModule,
    SeekerOnboardingModule,
    SeekerCareerModule,
    SeekerDashboardModule,
  ],
})
export class AppModule {}
