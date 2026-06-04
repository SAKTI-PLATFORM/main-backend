import { ApiProperty } from '@nestjs/swagger';
import { SeekerProfile } from 'src/domain/entity/seeker-profile.entity';
import { OnboardingStep } from 'src/domain/enums/seeker.enum';

/** Lightweight payload returned after each onboarding step. */
export class OnboardingStepResult {
  @ApiProperty({ enum: OnboardingStep })
  step: OnboardingStep;

  @ApiProperty({ example: 50 })
  profileCompleteness: number;

  private constructor(step: OnboardingStep, profileCompleteness: number) {
    this.step = step;
    this.profileCompleteness = profileCompleteness;
  }

  public static from(
    step: OnboardingStep,
    profile: SeekerProfile,
  ): OnboardingStepResult {
    return new OnboardingStepResult(step, profile.profileCompleteness);
  }
}
