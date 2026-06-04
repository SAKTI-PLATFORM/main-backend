import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerPreference } from 'src/domain/entity/career-preference.entity';
import { OnboardingStep } from 'src/domain/enums/seeker.enum';
import { SeekerProfileService } from 'src/domain/service/seeker-profile.service';
import { Repository } from 'typeorm';
import { OnboardingStepResult } from '../onboarding-step.result';
import { SubmitVisionDto } from './submit-vision.dto';

@Injectable()
export class SubmitVisionUseCase {
  constructor(
    private readonly profileService: SeekerProfileService,
    @InjectRepository(CareerPreference)
    private readonly preferences: Repository<CareerPreference>,
  ) {}

  public async execute(
    userId: string,
    dto: SubmitVisionDto,
  ): Promise<OnboardingStepResult> {
    if (
      dto.salaryMin != null &&
      dto.salaryMax != null &&
      dto.salaryMin > dto.salaryMax
    ) {
      throw new BadRequestException('Gaji minimum tidak boleh melebihi maksimum');
    }

    const profile = await this.profileService.getOrCreate(userId);

    const preference =
      (await this.preferences.findOne({ where: { seekerId: profile.id } })) ??
      this.create(profile.id);

    preference.targetRole = dto.targetRole;
    preference.workModes = dto.workModes;
    preference.salaryMin = dto.salaryMin ?? null;
    preference.salaryMax = dto.salaryMax ?? null;
    preference.companyTypes = dto.companyTypes;
    preference.jobTypes = dto.jobTypes;
    await this.preferences.save(preference);

    const saved = await this.profileService.refreshCompleteness(profile);
    return OnboardingStepResult.from(OnboardingStep.VISION, saved);
  }

  private create(seekerId: string): CareerPreference {
    const preference = new CareerPreference();
    preference.seekerId = seekerId;
    return preference;
  }
}
