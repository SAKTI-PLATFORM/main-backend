import { Injectable } from '@nestjs/common';
import { SeekerProfileService } from 'src/domain/service/seeker-profile.service';
import { OnboardingStep } from 'src/domain/enums/seeker.enum';
import { OnboardingStepResult } from '../onboarding-step.result';
import { SubmitFoundationDto } from './submit-foundation.dto';

@Injectable()
export class SubmitFoundationUseCase {
  constructor(private readonly profileService: SeekerProfileService) {}

  public async execute(
    userId: string,
    dto: SubmitFoundationDto,
  ): Promise<OnboardingStepResult> {
    const profile = await this.profileService.getOrCreate(userId);

    profile.phone = dto.phoneNumber ?? null;
    profile.dob = dto.dob ?? null;
    profile.gender = dto.gender;
    profile.employmentStatus = dto.employmentStatus;
    profile.educationLevel = dto.educationLevel;
    profile.field = dto.field;

    const saved = await this.profileService.refreshCompleteness(profile);
    return OnboardingStepResult.from(OnboardingStep.FOUNDATION, saved);
  }
}
