import { SeekerProfile } from '../entity/seeker-profile.entity';
import { SeekerSkill } from '../entity/seeker-skill.entity';
import type { OceanScores } from '../types/psychometric.type';
import type { SeekerSnapshot } from '../types/career.type';

/**
 * Builds the {@link SeekerSnapshot} that the matching / skill-gap / benchmark
 * services consume, from the MySQL aggregate. Hard-constraint inputs (salary,
 * work mode, job type) come from the career preference; semantic inputs (skills,
 * psychometrics) from the profile.
 */
export class SeekerSnapshotBuilder {
  public static build(
    profile: SeekerProfile,
    skills: SeekerSkill[],
  ): SeekerSnapshot {
    const preference = profile.careerPreference;
    return {
      skills: skills.map((skill) => ({
        name: skill.name,
        hours: skill.hoursEstimate ?? 0,
      })),
      educationLevel: profile.educationLevel ?? null,
      location: null, // not captured in onboarding yet → lenient location gate
      salaryMin: preference?.salaryMin ?? null,
      salaryMax: preference?.salaryMax ?? null,
      workModes: preference?.workModes ?? [],
      jobTypes: preference?.jobTypes ?? [],
      ocean: (profile.oceanScores as Partial<OceanScores>) ?? {},
      hollandCode: profile.hollandCode ?? null,
    };
  }
}
