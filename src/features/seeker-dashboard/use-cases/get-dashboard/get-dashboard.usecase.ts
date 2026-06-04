import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeekerProfile } from 'src/domain/entity/seeker-profile.entity';
import { SeekerSkill } from 'src/domain/entity/seeker-skill.entity';
import { SeekerCareerService } from 'src/features/seeker-career/seeker-career.service';
import { Repository } from 'typeorm';
import { DashboardResponse, DashboardStrengthSkill } from './dashboard.response';

const TOP_STRENGTH_LIMIT = 5;

@Injectable()
export class GetDashboardUseCase {
  constructor(
    @InjectRepository(SeekerProfile)
    private readonly profiles: Repository<SeekerProfile>,
    @InjectRepository(SeekerSkill)
    private readonly skills: Repository<SeekerSkill>,
    private readonly career: SeekerCareerService,
  ) {}

  public async execute(userId: string): Promise<DashboardResponse> {
    const profile = await this.profiles.findOne({
      where: { userId },
      relations: { user: true, careerPreference: true },
    });
    if (!profile) {
      throw new NotFoundException('Profil seeker belum dibuat. Selesaikan onboarding.');
    }

    const skills = await this.skills.find({ where: { seekerId: profile.id } });
    const bundle = await this.career.buildBundle(profile, skills);

    return {
      profile: {
        fullName: profile.user?.username ?? '',
        employmentStatus: profile.employmentStatus ?? null,
        educationLevel: profile.educationLevel ?? null,
        field: profile.field ?? null,
        targetRole: profile.careerPreference?.targetRole ?? null,
      },
      employabilityScore: bundle.employabilityScore,
      profileCompleteness: profile.profileCompleteness,
      matchedCount: bundle.matchedCount,
      ocean: this.buildOcean(profile),
      riasec: this.buildRiasec(profile),
      topStrengthSkills: this.topStrengthSkills(skills),
      marketBenchmark: bundle.benchmark,
      skillGaps: bundle.skillGaps,
      jobRecommendations: bundle.matches,
      aiInsight: bundle.insight,
    };
  }

  private buildOcean(profile: SeekerProfile): DashboardResponse['ocean'] {
    if (!profile.oceanScores || !profile.oceanTraitConfidence) {
      return null;
    }
    return {
      scores: profile.oceanScores,
      traitConfidence: profile.oceanTraitConfidence,
      confidence: profile.oceanConfidence ?? 0,
    };
  }

  private buildRiasec(profile: SeekerProfile): DashboardResponse['riasec'] {
    if (!profile.riasecScores || !profile.hollandCode) {
      return null;
    }
    return { scores: profile.riasecScores, hollandCode: profile.hollandCode };
  }

  private topStrengthSkills(skills: SeekerSkill[]): DashboardStrengthSkill[] {
    return [...skills]
      .sort((a, b) => (b.hoursEstimate ?? 0) - (a.hoursEstimate ?? 0))
      .slice(0, TOP_STRENGTH_LIMIT)
      .map((skill) => ({
        name: skill.name,
        category: skill.category,
        hoursEstimate: skill.hoursEstimate ?? null,
      }));
  }
}
