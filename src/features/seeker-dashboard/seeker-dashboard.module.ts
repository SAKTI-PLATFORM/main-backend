import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SeekerProfile } from 'src/domain/entity/seeker-profile.entity';
import { SeekerSkill } from 'src/domain/entity/seeker-skill.entity';
import { SeekerCareerModule } from '../seeker-career/seeker-career.module';
import { SeekerDashboardController } from './seeker-dashboard.controller';
import { GetDashboardUseCase } from './use-cases/get-dashboard/get-dashboard.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeekerProfile, SeekerSkill]),
    AuthModule,
    SeekerCareerModule,
  ],
  controllers: [SeekerDashboardController],
  providers: [GetDashboardUseCase],
})
export class SeekerDashboardModule {}
