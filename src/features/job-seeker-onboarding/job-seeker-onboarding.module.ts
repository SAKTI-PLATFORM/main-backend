import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Certification } from 'src/domain/entity/certification.entity';
import { CvDocument } from 'src/domain/entity/cv-document.entity';
import { Education } from 'src/domain/entity/education.entity';
import { Experience } from 'src/domain/entity/experience.entity';
import { JobseekerProfile } from 'src/domain/entity/jobseeker-profile.entity';
import { ParsedCvData } from 'src/domain/entity/parsed-cv-data.entity';
import { Project } from 'src/domain/entity/project.entity';
import { UserSkill } from 'src/domain/entity/user-skill.entity';
import { User } from 'src/domain/entity/user.entity';
import { SaktiAiModule } from 'src/infrastructure/sakti-ai/sakti-ai.module';
import { JobSeekerOnboardingController } from './job-seeker-onboarding.controller';
import {
  CreateCertificationUseCase,
  CreateEducationUseCase,
  CreateExperienceUseCase,
  CreateProjectUseCase,
  CreateSkillUseCase,
  ParseCvUseCase,
  UpdateIdentityUseCase,
} from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CvDocument,
      ParsedCvData,
      Education,
      Experience,
      Project,
      Certification,
      UserSkill,
      User,
      JobseekerProfile,
    ]),
    AuthModule,
    SaktiAiModule,
  ],
  controllers: [JobSeekerOnboardingController],
  providers: [
    ParseCvUseCase,
    CreateEducationUseCase,
    CreateExperienceUseCase,
    CreateProjectUseCase,
    CreateCertificationUseCase,
    CreateSkillUseCase,
    UpdateIdentityUseCase,
  ],
})
export class JobSeekerOnboardingModule {}
