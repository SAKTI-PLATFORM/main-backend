import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from 'src/domain/entity/assessment.entity';
import { AssessmentInstrument, OnboardingStep } from 'src/domain/enums/seeker.enum';
import { SeekerProfileService } from 'src/domain/service/seeker-profile.service';
import type { PsychometricResult } from 'src/domain/types/psychometric.type';
import { SaktiAiClient } from 'src/infrastructure/sakti-ai/sakti-ai.client';
import { Repository } from 'typeorm';
import { OnboardingStepResult } from '../onboarding-step.result';
import { SubmitAssessmentDto } from './submit-assessment.dto';

@Injectable()
export class SubmitAssessmentUseCase {
  constructor(
    private readonly profileService: SeekerProfileService,
    private readonly saktiAi: SaktiAiClient,
    @InjectRepository(Assessment)
    private readonly assessments: Repository<Assessment>,
  ) {}

  public async execute(
    userId: string,
    dto: SubmitAssessmentDto,
  ): Promise<OnboardingStepResult> {
    const profile = await this.profileService.getOrCreate(userId);

    const result = await this.saktiAi.scorePsychometric({
      oceanResponses: dto.oceanResponses,
      riasecResponses: dto.riasecResponses,
    });

    await this.persistAssessments(profile.id, dto, result);

    profile.applyPsychometric(result);
    const saved = await this.profileService.refreshCompleteness(profile);
    return OnboardingStepResult.from(OnboardingStep.ASSESSMENT, saved);
  }

  /** Store raw responses + computed scores per instrument (re-scorable later). */
  private async persistAssessments(
    seekerId: string,
    dto: SubmitAssessmentDto,
    result: PsychometricResult,
  ): Promise<void> {
    await this.assessments.delete({ seekerId });

    const bfi10 = this.buildAssessment(seekerId, AssessmentInstrument.BFI10, {
      responses: dto.oceanResponses,
      scores: result.ocean,
      confidence: result.ocean.confidence,
    });
    const riasec42 = this.buildAssessment(seekerId, AssessmentInstrument.RIASEC42, {
      responses: dto.riasecResponses,
      scores: result.riasec,
      confidence: null,
    });

    await this.assessments.save([bfi10, riasec42]);
  }

  private buildAssessment(
    seekerId: string,
    instrument: AssessmentInstrument,
    data: { responses: unknown; scores: unknown; confidence: number | null },
  ): Assessment {
    const assessment = new Assessment();
    assessment.seekerId = seekerId;
    assessment.instrument = instrument;
    assessment.responses = data.responses;
    assessment.scores = data.scores;
    assessment.confidence = data.confidence;
    return assessment;
  }
}
