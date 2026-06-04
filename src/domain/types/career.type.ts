import type { OceanScores } from './psychometric.type';

/**
 * Snapshot of a seeker used by the matching/skill-gap/benchmark services.
 * Built from MySQL by {@link SeekerSnapshotBuilder} and sent to microservices-backend.
 */
export interface SeekerSnapshot {
  skills: Array<{ name: string; hours: number }>;
  educationLevel: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  workModes: string[];
  jobTypes: string[];
  ocean: Partial<OceanScores>;
  hollandCode: string | null;
}

export interface MatchBreakdown {
  skill: number;
  education: number;
  experience: number;
  location: number;
  preference: number;
  oceanBonus: number;
  riasecBonus: number;
}

export type MatchStatus = 'matched' | 'rise' | 'no_match';

export interface MatchResult {
  jobId: string;
  title: string;
  company: string | null;
  totalScore: number; // 0..1
  status: MatchStatus;
  autoApplied: boolean;
  breakdown: MatchBreakdown;
  shap: Record<string, number>;
}

export interface CourseRef {
  title: string;
  provider: string;
  url: string;
  cost: string;
}

export interface SkillGap {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  currentHours: number;
  targetHours: number;
  gapHours: number;
  course: CourseRef | null;
}

export interface SkillGapResult {
  role: string;
  totalGapHours: number;
  gaps: SkillGap[];
}

export interface BenchmarkBar {
  skill: string;
  marketDemand: number; // 0..1
  yourScore: number; // 0..1
}

export interface SkillHighlight {
  skill: string;
  score: number; // 0..1
}

export interface Benchmark {
  role: string;
  bars: BenchmarkBar[];
  potentialSkill: SkillHighlight | null;
  developmentArea: SkillHighlight | null;
}

export interface InsightResult {
  narrative: string;
  marketReady: boolean;
  source: string;
}

export interface RoleOption {
  id: string;
  name: string;
  hollandCode: string;
}

export interface InsightFacts {
  fullName: string;
  targetRole: string;
  employabilityScore: number;
  profileCompleteness: number;
  matchedCount: number;
  topMatchTitle: string | null;
  topMatchScore: number | null; // 0..1
  strengths: string[];
  topGaps: Array<{ skill: string; gapHours: number; priority: string }>;
  hollandCode: string | null;
}
