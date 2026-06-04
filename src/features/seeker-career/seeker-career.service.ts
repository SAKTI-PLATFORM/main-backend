import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeekerProfile } from 'src/domain/entity/seeker-profile.entity';
import { SeekerSkill } from 'src/domain/entity/seeker-skill.entity';
import { EmployabilityCalculator } from 'src/domain/service/employability.calculator';
import { SeekerSnapshotBuilder } from 'src/domain/service/seeker-snapshot.builder';
import type {
  Benchmark,
  InsightResult,
  MatchResult,
  RoleOption,
  SeekerSnapshot,
  SkillGapResult,
} from 'src/domain/types/career.type';
import { MicroservicesClient } from 'src/infrastructure/microservices/microservices.client';
import { SaktiAiClient } from 'src/infrastructure/sakti-ai/sakti-ai.client';
import { Repository } from 'typeorm';

const STRENGTHS_LIMIT = 3;
const MATCH_LIMIT = 6;

export interface CareerBundle {
  benchmark: Benchmark | null;
  skillGaps: SkillGapResult | null;
  matches: MatchResult[];
  employabilityScore: number | null;
  matchedCount: number;
  insight: InsightResult | null;
}

interface SeekerContext {
  profile: SeekerProfile;
  skills: SeekerSkill[];
  snapshot: SeekerSnapshot;
  targetRole: string | null;
}

/**
 * Application service orchestrating the career-data + ML services for a seeker.
 * Shared by the dashboard aggregation and the standalone matches / skill-gaps
 * endpoints (DRY). Every downstream call degrades gracefully — a service outage
 * yields a partial dashboard, never a 500.
 */
@Injectable()
export class SeekerCareerService {
  private readonly logger = new Logger(SeekerCareerService.name);

  constructor(
    @InjectRepository(SeekerProfile)
    private readonly profiles: Repository<SeekerProfile>,
    @InjectRepository(SeekerSkill)
    private readonly skills: Repository<SeekerSkill>,
    private readonly microservices: MicroservicesClient,
    private readonly saktiAi: SaktiAiClient,
  ) {}

  /** Reference list of target roles for the onboarding picker. */
  public async listRoles(): Promise<RoleOption[]> {
    return this.safe(() => this.microservices.listRoles(), []);
  }

  public async getMatches(userId: string): Promise<MatchResult[]> {
    const ctx = await this.loadContext(userId);
    return this.safe(
      () =>
        this.microservices.match(ctx.snapshot, {
          targetRole: ctx.targetRole,
          limit: MATCH_LIMIT,
        }),
      [],
    );
  }

  public async getSkillGaps(userId: string): Promise<SkillGapResult | null> {
    const ctx = await this.loadContext(userId);
    if (!ctx.targetRole) {
      return null;
    }
    return this.safe(
      () => this.microservices.skillGap(ctx.targetRole!, ctx.snapshot),
      null,
    );
  }

  /** One round-trip bundle for the dashboard — benchmark + gaps + matches + insight. */
  public async buildBundle(
    profile: SeekerProfile,
    skills: SeekerSkill[],
  ): Promise<CareerBundle> {
    const targetRole = profile.careerPreference?.targetRole ?? null;
    const empty: CareerBundle = {
      benchmark: null,
      skillGaps: null,
      matches: [],
      employabilityScore: null,
      matchedCount: 0,
      insight: null,
    };
    if (!targetRole) {
      return empty;
    }

    const snapshot = SeekerSnapshotBuilder.build(profile, skills);
    const [benchmark, skillGaps, matches] = await Promise.all([
      this.safe(() => this.microservices.benchmark(targetRole, snapshot), null),
      this.safe(() => this.microservices.skillGap(targetRole, snapshot), null),
      this.safe(
        () =>
          this.microservices.match(snapshot, { targetRole, limit: MATCH_LIMIT }),
        [],
      ),
    ]);

    const employabilityScore = EmployabilityCalculator.compute({
      benchmark,
      profileCompleteness: profile.profileCompleteness,
      matches,
    });
    const matchedCount = matches.filter((m) => m.status === 'matched').length;

    const insight = await this.safe(
      () =>
        this.saktiAi.insight({
          fullName: profile.user?.username ?? '',
          targetRole,
          employabilityScore,
          profileCompleteness: profile.profileCompleteness,
          matchedCount,
          topMatchTitle: matches[0]?.title ?? null,
          topMatchScore: matches[0]?.totalScore ?? null,
          strengths: this.topStrengthNames(skills),
          topGaps: (skillGaps?.gaps ?? []).slice(0, 3).map((g) => ({
            skill: g.skill,
            gapHours: g.gapHours,
            priority: g.priority,
          })),
          hollandCode: profile.hollandCode ?? null,
        }),
      null,
    );

    return {
      benchmark,
      skillGaps,
      matches,
      employabilityScore,
      matchedCount,
      insight,
    };
  }

  private async loadContext(userId: string): Promise<SeekerContext> {
    const profile = await this.profiles.findOne({
      where: { userId },
      relations: { user: true, careerPreference: true },
    });
    if (!profile) {
      throw new NotFoundException('Profil seeker belum dibuat. Selesaikan onboarding.');
    }
    const skills = await this.skills.find({ where: { seekerId: profile.id } });
    return {
      profile,
      skills,
      snapshot: SeekerSnapshotBuilder.build(profile, skills),
      targetRole: profile.careerPreference?.targetRole ?? null,
    };
  }

  private topStrengthNames(skills: SeekerSkill[]): string[] {
    return [...skills]
      .sort((a, b) => (b.hoursEstimate ?? 0) - (a.hoursEstimate ?? 0))
      .slice(0, STRENGTHS_LIMIT)
      .map((s) => s.name);
  }

  /** Run a downstream call, swallowing failures into a fallback so the page still renders. */
  private async safe<T>(call: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await call();
    } catch (error) {
      this.logger.warn(`career downstream degraded: ${(error as Error).message}`);
      return fallback;
    }
  }
}
