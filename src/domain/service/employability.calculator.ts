import type { Benchmark, MatchResult } from '../types/career.type';

const W_SKILL_COVERAGE = 0.5;
const W_COMPLETENESS = 0.3;
const W_TOP_MATCH = 0.2;

/**
 * Employability Score (design doc §9, composite — separate from match score):
 *
 *   employability = 100 × ( 0.5·skill_coverage_vs_target
 *                         + 0.3·profile_completeness
 *                         + 0.2·top_match_score )
 */
export class EmployabilityCalculator {
  public static compute(params: {
    benchmark: Benchmark | null;
    profileCompleteness: number; // 0..100
    matches: MatchResult[];
  }): number {
    const skillCoverage = this.skillCoverage(params.benchmark);
    const completenessFrac = params.profileCompleteness / 100;
    const topMatch = params.matches[0]?.totalScore ?? 0;

    const composite =
      W_SKILL_COVERAGE * skillCoverage +
      W_COMPLETENESS * completenessFrac +
      W_TOP_MATCH * topMatch;

    return Number((composite * 100).toFixed(2));
  }

  /** Mean mastery across the target role's demanded skills (0..1). */
  private static skillCoverage(benchmark: Benchmark | null): number {
    if (!benchmark || benchmark.bars.length === 0) {
      return 0;
    }
    const sum = benchmark.bars.reduce((acc, bar) => acc + bar.yourScore, 0);
    return sum / benchmark.bars.length;
  }
}
