import { ApiProperty } from '@nestjs/swagger';
import type {
  Benchmark,
  InsightResult,
  MatchResult,
  SkillGapResult,
} from 'src/domain/types/career.type';
import type {
  OceanScores,
  OceanTraitConfidence,
  RiasecScores,
} from 'src/domain/types/psychometric.type';

export class DashboardProfileSummary {
  @ApiProperty() fullName: string;
  @ApiProperty({ nullable: true }) employmentStatus: string | null;
  @ApiProperty({ nullable: true }) educationLevel: string | null;
  @ApiProperty({ nullable: true }) field: string | null;
  @ApiProperty({ nullable: true }) targetRole: string | null;
}

export class DashboardOcean {
  @ApiProperty() scores: OceanScores;
  @ApiProperty() traitConfidence: OceanTraitConfidence;
  @ApiProperty() confidence: number;
}

export class DashboardRiasec {
  @ApiProperty() scores: RiasecScores;
  @ApiProperty() hollandCode: string;
}

export class DashboardStrengthSkill {
  @ApiProperty() name: string;
  @ApiProperty() category: string;
  @ApiProperty({ nullable: true }) hoursEstimate: number | null;
}

export class DashboardResponse {
  @ApiProperty({ type: DashboardProfileSummary })
  profile: DashboardProfileSummary;

  @ApiProperty({ description: 'Komposit §9; null sampai target role di-set', nullable: true })
  employabilityScore: number | null;

  @ApiProperty({ example: 75 })
  profileCompleteness: number;

  @ApiProperty({ example: 2, description: "COUNT(matches WHERE status='matched')" })
  matchedCount: number;

  @ApiProperty({ type: DashboardOcean, nullable: true })
  ocean: DashboardOcean | null;

  @ApiProperty({ type: DashboardRiasec, nullable: true })
  riasec: DashboardRiasec | null;

  @ApiProperty({ type: [DashboardStrengthSkill] })
  topStrengthSkills: DashboardStrengthSkill[];

  @ApiProperty({ description: 'Market Benchmark & Skill Demand (§12)', nullable: true })
  marketBenchmark: Benchmark | null;

  @ApiProperty({ description: 'Skill Gap Prioritas (TalentForge)', nullable: true })
  skillGaps: SkillGapResult | null;

  @ApiProperty({ description: 'Lowongan Untukmu (Matchmaker RAG-A)', type: 'array', items: { type: 'object' } })
  jobRecommendations: MatchResult[];

  @ApiProperty({ description: 'AI Insight grounded (RAG-B)', nullable: true })
  aiInsight: InsightResult | null;
}
