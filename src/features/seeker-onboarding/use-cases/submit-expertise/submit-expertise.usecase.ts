import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeekerSkill } from 'src/domain/entity/seeker-skill.entity';
import { OnboardingStep, SkillSource } from 'src/domain/enums/seeker.enum';
import { ExpertiseMapper } from 'src/domain/service/expertise.mapper';
import { SeekerProfileService } from 'src/domain/service/seeker-profile.service';
import { Repository } from 'typeorm';
import { OnboardingStepResult } from '../onboarding-step.result';
import { SubmitExpertiseDto } from './submit-expertise.dto';

@Injectable()
export class SubmitExpertiseUseCase {
  constructor(
    private readonly profileService: SeekerProfileService,
    @InjectRepository(SeekerSkill)
    private readonly skills: Repository<SeekerSkill>,
  ) {}

  public async execute(
    userId: string,
    dto: SubmitExpertiseDto,
  ): Promise<OnboardingStepResult> {
    const profile = await this.profileService.getOrCreate(userId);

    // Idempotent: re-submitting replaces previously declared skills, while
    // CV-sourced skills (source = 'cv') are left untouched.
    await this.skills.delete({
      seekerId: profile.id,
      source: SkillSource.DECLARED,
    });

    const declaredSkills = ExpertiseMapper.buildDeclaredSkills({
      seekerId: profile.id,
      tools: dto.tools,
      knowledgeAreas: dto.knowledgeAreas,
      softSkillsRanked: dto.softSkillsRanked,
    });
    if (declaredSkills.length > 0) {
      await this.skills.save(declaredSkills);
    }

    const saved = await this.profileService.refreshCompleteness(profile);
    return OnboardingStepResult.from(OnboardingStep.EXPERTISE, saved);
  }
}
