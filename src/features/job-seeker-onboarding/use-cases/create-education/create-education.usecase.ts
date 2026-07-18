import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Education } from 'src/domain/entity/education.entity';
import { RecordSource } from 'src/domain/enums/record-source.enum';
import { Repository } from 'typeorm';
import { OnboardingRecordResponse } from '../onboarding.response';
import { CreateEducationDto } from './create-education.dto';

@Injectable()
export class CreateEducationUseCase {
  constructor(
    @InjectRepository(Education)
    private readonly educationRepository: Repository<Education>,
  ) {}

  async execute(
    userId: string,
    dto: CreateEducationDto,
  ): Promise<OnboardingRecordResponse> {
    const education = this.educationRepository.create({
      userId,
      educationLevel: dto.educationLevel ?? null,
      institution: dto.institution ?? null,
      major: dto.major ?? null,
      degree: dto.degree,
      startYear: dto.startYear ?? null,
      endYear: dto.endYear ?? null,
      gpa: dto.gpa ?? null,
      isCurrent: dto.isCurrent ?? false,
      source: RecordSource.MANUAL,
    });
    const saved = await this.educationRepository.save(education);
    return { id: saved.educationId };
  }
}
