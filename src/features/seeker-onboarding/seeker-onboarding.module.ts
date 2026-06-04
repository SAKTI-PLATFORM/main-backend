import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Assessment } from 'src/domain/entity/assessment.entity';
import { CareerPreference } from 'src/domain/entity/career-preference.entity';
import { SeekerProfile } from 'src/domain/entity/seeker-profile.entity';
import { SeekerSkill } from 'src/domain/entity/seeker-skill.entity';
import { SeekerProfileService } from 'src/domain/service/seeker-profile.service';
import { SeekerOnboardingController } from './seeker-onboarding.controller';
import {
  SubmitAssessmentUseCase,
  SubmitExpertiseUseCase,
  SubmitFoundationUseCase,
  SubmitVisionUseCase,
} from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SeekerProfile,
      SeekerSkill,
      Assessment,
      CareerPreference,
    ]),
    AuthModule,
  ],
  controllers: [SeekerOnboardingController],
  providers: [
    SeekerProfileService,
    SubmitFoundationUseCase,
    SubmitExpertiseUseCase,
    SubmitAssessmentUseCase,
    SubmitVisionUseCase,
  ],
  exports: [SeekerProfileService],
})
export class SeekerOnboardingModule {}
