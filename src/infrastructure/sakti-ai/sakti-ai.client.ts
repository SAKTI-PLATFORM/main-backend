import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  InsightFacts,
  InsightResult,
} from 'src/domain/types/career.type';
import type {
  OceanResponse,
  PsychometricResult,
  RiasecResponse,
} from 'src/domain/types/psychometric.type';

interface SaktiEnvelope<T> {
  status: string;
  message: string;
  data: T;
}

/**
 * Thin typed HTTP client for the SAKTI-AI ML service. NestJS owns orchestration;
 * all inference (psychometric scoring, CV parse, embedding, matching) is delegated
 * here so use-cases never talk HTTP directly.
 */
@Injectable()
export class SaktiAiClient {
  private readonly logger = new Logger(SaktiAiClient.name);
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('app.saktiAi.url') ?? 'http://localhost:8001';
  }

  public async scorePsychometric(payload: {
    oceanResponses: OceanResponse[];
    riasecResponses: RiasecResponse[];
  }): Promise<PsychometricResult> {
    return this.post<PsychometricResult>('/ml/score-psychometric', {
      ocean_responses: payload.oceanResponses,
      riasec_responses: payload.riasecResponses,
    });
  }

  /** RAG-B grounded "Market Ready" narrative for the dashboard insight card. */
  public async insight(facts: InsightFacts): Promise<InsightResult> {
    const result = await this.post<{
      narrative: string;
      market_ready: boolean;
      source: string;
    }>('/ml/insight', {
      full_name: facts.fullName,
      target_role: facts.targetRole,
      employability_score: facts.employabilityScore,
      profile_completeness: facts.profileCompleteness,
      matched_count: facts.matchedCount,
      top_match_title: facts.topMatchTitle,
      top_match_score: facts.topMatchScore,
      strengths: facts.strengths,
      top_gaps: facts.topGaps.map((g) => ({
        skill: g.skill,
        gap_hours: g.gapHours,
        priority: g.priority,
      })),
      holland_code: facts.hollandCode,
    });
    return {
      narrative: result.narrative,
      marketReady: result.market_ready,
      source: result.source,
    };
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.logger.error(`SAKTI-AI unreachable at ${url}`, error as Error);
      throw new InternalServerErrorException('Layanan SAKTI-AI tidak dapat dihubungi');
    }

    if (!response.ok) {
      const detail = await response.text();
      this.logger.error(`SAKTI-AI ${path} -> ${response.status}: ${detail}`);
      throw new InternalServerErrorException('Gagal memproses inferensi SAKTI-AI');
    }

    const envelope = (await response.json()) as SaktiEnvelope<T>;
    return envelope.data;
  }
}
