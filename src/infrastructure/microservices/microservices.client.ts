import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Benchmark,
  MatchResult,
  RoleOption,
  SeekerSnapshot,
  SkillGapResult,
} from 'src/domain/types/career.type';

interface Envelope<T> {
  status: string;
  message: string;
  data: T;
}

/** Wire shape (snake_case) of the seeker snapshot expected by microservices-backend. */
function toWireSnapshot(snapshot: SeekerSnapshot): Record<string, unknown> {
  return {
    skills: snapshot.skills,
    education_level: snapshot.educationLevel,
    location: snapshot.location,
    salary_min: snapshot.salaryMin,
    salary_max: snapshot.salaryMax,
    work_modes: snapshot.workModes,
    job_types: snapshot.jobTypes,
    ocean: snapshot.ocean,
    holland_code: snapshot.hollandCode,
  };
}

/**
 * Typed HTTP client for microservices-backend (career domain-data + matching).
 * NestJS owns orchestration; the heavy matching/skill-gap math lives where the
 * jobs/roles data lives. Wire payloads are snake_case; we map to camelCase here.
 */
@Injectable()
export class MicroservicesClient {
  private readonly logger = new Logger(MicroservicesClient.name);
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.baseUrl =
      config.get<string>('app.microservices.url') ?? 'http://localhost:9000';
  }

  public async listRoles(): Promise<RoleOption[]> {
    const data = await this.get<
      Array<{ id: string; name: string; ideal_holland: string }>
    >('/career/roles');
    return data.map((r) => ({
      id: r.id,
      name: r.name,
      hollandCode: r.ideal_holland,
    }));
  }

  public async match(
    snapshot: SeekerSnapshot,
    options: { targetRole?: string | null; limit?: number } = {},
  ): Promise<MatchResult[]> {
    const data = await this.post<WireMatch[]>('/career/match', {
      seeker: toWireSnapshot(snapshot),
      target_role: options.targetRole ?? null,
      limit: options.limit ?? 10,
    });
    return data.map(mapMatch);
  }

  public async skillGap(
    targetRole: string,
    snapshot: SeekerSnapshot,
  ): Promise<SkillGapResult> {
    const data = await this.post<WireSkillGapResult>('/career/skill-gap', {
      target_role: targetRole,
      seeker: toWireSnapshot(snapshot),
    });
    return mapSkillGapResult(data);
  }

  public async benchmark(
    targetRole: string,
    snapshot: SeekerSnapshot,
  ): Promise<Benchmark> {
    const data = await this.post<WireBenchmark>('/career/market-benchmark', {
      target_role: targetRole,
      seeker: toWireSnapshot(snapshot),
    });
    return mapBenchmark(data);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      this.logger.error(`microservices unreachable at ${url}`, error as Error);
      throw new InternalServerErrorException(
        'Layanan data karir tidak dapat dihubungi',
      );
    }

    if (!response.ok) {
      const detail = await response.text();
      this.logger.error(`microservices ${path} -> ${response.status}: ${detail}`);
      throw new InternalServerErrorException('Gagal memproses data karir');
    }

    const envelope = (await response.json()) as Envelope<T>;
    return envelope.data;
  }
}

// --- wire types (snake_case) ---
interface WireMatch {
  job_id: string;
  title: string;
  company: string | null;
  total_score: number;
  status: MatchResult['status'];
  auto_applied: boolean;
  breakdown: {
    skill: number;
    education: number;
    experience: number;
    location: number;
    preference: number;
    ocean_bonus: number;
    riasec_bonus: number;
  };
  shap: Record<string, number>;
}

interface WireCourse {
  title: string;
  provider: string;
  url: string;
  cost: string;
}

interface WireSkillGap {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  current_hours: number;
  target_hours: number;
  gap_hours: number;
  course: WireCourse | null;
}

interface WireSkillGapResult {
  role: string;
  total_gap_hours: number;
  gaps: WireSkillGap[];
}

interface WireBenchmark {
  role: string;
  bars: Array<{ skill: string; market_demand: number; your_score: number }>;
  potential_skill: { skill: string; score: number } | null;
  development_area: { skill: string; score: number } | null;
}

// --- mappers ---
function mapMatch(m: WireMatch): MatchResult {
  return {
    jobId: m.job_id,
    title: m.title,
    company: m.company,
    totalScore: m.total_score,
    status: m.status,
    autoApplied: m.auto_applied,
    breakdown: {
      skill: m.breakdown.skill,
      education: m.breakdown.education,
      experience: m.breakdown.experience,
      location: m.breakdown.location,
      preference: m.breakdown.preference,
      oceanBonus: m.breakdown.ocean_bonus,
      riasecBonus: m.breakdown.riasec_bonus,
    },
    shap: m.shap,
  };
}

function mapSkillGapResult(r: WireSkillGapResult): SkillGapResult {
  return {
    role: r.role,
    totalGapHours: r.total_gap_hours,
    gaps: r.gaps.map((g) => ({
      skill: g.skill,
      priority: g.priority,
      currentHours: g.current_hours,
      targetHours: g.target_hours,
      gapHours: g.gap_hours,
      course: g.course,
    })),
  };
}

function mapBenchmark(b: WireBenchmark): Benchmark {
  return {
    role: b.role,
    bars: b.bars.map((bar) => ({
      skill: bar.skill,
      marketDemand: bar.market_demand,
      yourScore: bar.your_score,
    })),
    potentialSkill: b.potential_skill,
    developmentArea: b.development_area,
  };
}
