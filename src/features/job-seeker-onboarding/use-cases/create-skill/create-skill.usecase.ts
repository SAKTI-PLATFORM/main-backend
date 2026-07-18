import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSkill } from 'src/domain/entity/user-skill.entity';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { OnboardingRecordResponse } from '../onboarding.response';
import { CreateSkillDto } from './create-skill.dto';

@Injectable()
export class CreateSkillUseCase {
  constructor(
    @InjectRepository(UserSkill)
    private readonly skillRepository: Repository<UserSkill>,
  ) {}

  async execute(
    userId: string,
    dto: CreateSkillDto,
  ): Promise<OnboardingRecordResponse> {
    const skill = this.skillRepository.create({
      userId,
      skillId: dto.skillId ?? uuidv7(),
      detectedText: dto.detectedText,
      confidenceScore: dto.confidenceScore ?? null,
      learningHours: dto.learningHours ?? null,
      workingHours: dto.workingHours ?? null,
      evidenceSource: dto.evidenceSource ?? 'manual',
      evidenceStrength: dto.evidenceStrength ?? null,
    });
    const saved = await this.skillRepository.save(skill);
    return { id: saved.userSkillId };
  }
}
