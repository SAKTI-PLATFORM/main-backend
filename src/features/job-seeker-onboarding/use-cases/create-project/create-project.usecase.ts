import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/domain/entity/project.entity';
import { RecordSource } from 'src/domain/enums/record-source.enum';
import { Repository } from 'typeorm';
import { OnboardingRecordResponse } from '../onboarding.response';
import { CreateProjectDto } from './create-project.dto';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async execute(
    userId: string,
    dto: CreateProjectDto,
  ): Promise<OnboardingRecordResponse> {
    const project = this.projectRepository.create({
      userId,
      projectName: dto.projectName,
      description: dto.description ?? null,
      toolsUsed: dto.toolsUsed ?? null,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      source: dto.source ?? RecordSource.MANUAL,
    });
    const saved = await this.projectRepository.save(project);
    return { id: saved.projectId };
  }
}
