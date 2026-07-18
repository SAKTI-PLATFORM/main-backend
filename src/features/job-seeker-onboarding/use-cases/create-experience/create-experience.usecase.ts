import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Experience } from 'src/domain/entity/experience.entity';
import { RecordSource } from 'src/domain/enums/record-source.enum';
import { Repository } from 'typeorm';
import { OnboardingRecordResponse } from '../onboarding.response';
import { CreateExperienceDto } from './create-experience.dto';

@Injectable()
export class CreateExperienceUseCase {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
  ) {}

  async execute(
    userId: string,
    dto: CreateExperienceDto,
  ): Promise<OnboardingRecordResponse> {
    const experience = this.experienceRepository.create({
      userId,
      title: dto.title,
      organization: dto.organization,
      experienceType: dto.experienceType,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      isCurrent: dto.isCurrent ?? false,
      durationMonths: dto.durationMonths ?? null,
      description: dto.description ?? null,
      source: dto.source ?? RecordSource.MANUAL,
    });
    const saved = await this.experienceRepository.save(experience);
    return { id: saved.experienceId };
  }
}
