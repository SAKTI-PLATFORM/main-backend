import { SkillCategory, SkillSource, ToolsExperience } from '../enums/seeker.enum';
import { SeekerSkill } from '../entity/seeker-skill.entity';

interface ExperienceProfile {
  hours: number;
  proficiency: number;
}

/** Midpoint hour estimate + proficiency per experience bucket (design doc §5 Step 02). */
const EXPERIENCE_PROFILE: Record<ToolsExperience, ExperienceProfile> = {
  [ToolsExperience.ZERO_SIX_MONTHS]: { hours: 120, proficiency: 0.2 },
  [ToolsExperience.SIX_TWELVE_MONTHS]: { hours: 300, proficiency: 0.35 },
  [ToolsExperience.ONE_TWO_YEARS]: { hours: 700, proficiency: 0.5 },
  [ToolsExperience.TWO_THREE_YEARS]: { hours: 1200, proficiency: 0.65 },
  [ToolsExperience.THREE_FIVE_YEARS]: { hours: 2000, proficiency: 0.8 },
  [ToolsExperience.OVER_FIVE_YEARS]: { hours: 3000, proficiency: 0.9 },
};

/** Self-declared skills carry lower confidence than CV-evidenced ones. */
const DECLARED_CONFIDENCE = 0.5;

/** Fallback when a tool was declared without a chosen experience bucket. */
const UNKNOWN_TOOL_PROFILE: ExperienceProfile = { hours: 0, proficiency: 0.3 };

/** A declared tool paired with its own experience bucket (key-value). */
export interface ToolEntry {
  name: string;
  experience?: ToolsExperience;
}

/**
 * Builds the `SeekerSkill` rows for Step 02 (self-declaration). Each tool carries
 * its OWN experience bucket → its own hours/proficiency estimate; knowledge areas
 * get a neutral proficiency; soft skills are ranked 1..5 (1 = strongest) and
 * mapped onto a proficiency gradient.
 */
export class ExpertiseMapper {
  public static buildDeclaredSkills(params: {
    seekerId: string;
    tools: ToolEntry[];
    knowledgeAreas: string[];
    softSkillsRanked: string[];
  }): SeekerSkill[] {
    const toolSkills = params.tools.map((tool) => {
      const profile = tool.experience
        ? EXPERIENCE_PROFILE[tool.experience]
        : UNKNOWN_TOOL_PROFILE;
      return this.make(params.seekerId, tool.name, SkillCategory.TOOL, {
        proficiency: profile.proficiency,
        hoursEstimate: profile.hours,
      });
    });

    const knowledgeSkills = params.knowledgeAreas.map((name) =>
      this.make(params.seekerId, name, SkillCategory.KNOWLEDGE, {
        proficiency: 0.4,
      }),
    );

    const softSkills = params.softSkillsRanked.map((name, index) =>
      this.make(params.seekerId, name, SkillCategory.SOFT, {
        proficiency: this.rankToProficiency(index, params.softSkillsRanked.length),
      }),
    );

    return [...toolSkills, ...knowledgeSkills, ...softSkills];
  }

  /** Rank 1 (index 0) -> 1.0 down to the last rank -> 0.5. */
  private static rankToProficiency(index: number, total: number): number {
    if (total <= 1) return 1;
    const normalized = index / (total - 1); // 0..1
    return Number((1 - normalized * 0.5).toFixed(3));
  }

  private static make(
    seekerId: string,
    name: string,
    category: SkillCategory,
    extra: { proficiency: number; hoursEstimate?: number },
  ): SeekerSkill {
    const skill = new SeekerSkill();
    skill.seekerId = seekerId;
    skill.name = name.trim().toLowerCase();
    skill.category = category;
    skill.source = SkillSource.DECLARED;
    skill.proficiency = extra.proficiency;
    skill.confidence = DECLARED_CONFIDENCE;
    skill.hoursEstimate = extra.hoursEstimate ?? null;
    return skill;
  }
}
