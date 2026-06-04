import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { numericTransformer } from 'src/infrastructure/persistence/numeric.transformer';
import {
  EducationLevel,
  EmploymentStatus,
  FieldOfInterest,
  Gender,
} from '../enums/seeker.enum';
import type {
  OceanScores,
  OceanTraitConfidence,
  PsychometricResult,
  RiasecRawScores,
  RiasecScores,
} from '../types/psychometric.type';
import { BaseEntity } from './abstract/base.entity';
import { Assessment } from './assessment.entity';
import { CareerPreference } from './career-preference.entity';
import { Education } from './education.entity';
import { Experience } from './experience.entity';
import { SeekerSkill } from './seeker-skill.entity';
import { User } from './user.entity';

const ONBOARDING_SECTION_COUNT = 4;

@Entity({ name: 'seeker_profiles' })
export class SeekerProfile extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'phone', type: 'varchar', length: 30, nullable: true })
  phone?: string | null;

  @Column({ type: 'date', nullable: true })
  dob?: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender | null;

  @Column({ name: 'employment_status', type: 'enum', enum: EmploymentStatus, nullable: true })
  employmentStatus?: EmploymentStatus | null;

  @Column({ name: 'education_level', type: 'enum', enum: EducationLevel, nullable: true })
  educationLevel?: EducationLevel | null;

  @Column({ type: 'enum', enum: FieldOfInterest, nullable: true })
  field?: FieldOfInterest | null;

  @Column({ name: 'ocean_scores', type: 'json', nullable: true })
  oceanScores?: OceanScores | null;

  @Column({ name: 'ocean_trait_confidence', type: 'json', nullable: true })
  oceanTraitConfidence?: OceanTraitConfidence | null;

  @Column({ name: 'riasec_scores', type: 'json', nullable: true })
  riasecScores?: RiasecScores | null;

  @Column({ name: 'riasec_raw', type: 'json', nullable: true })
  riasecRaw?: RiasecRawScores | null;

  @Column({ name: 'holland_code', type: 'varchar', length: 3, nullable: true })
  hollandCode?: string | null;

  @Column({
    name: 'ocean_confidence',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  oceanConfidence?: number | null;

  @Column({
    name: 'profile_completeness',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  profileCompleteness: number;

  @Column({
    name: 'employability_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  employabilityScore?: number | null;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => SeekerSkill, (skill) => skill.seeker)
  skills: SeekerSkill[];

  @OneToMany(() => Experience, (experience) => experience.seeker)
  experiences: Experience[];

  @OneToMany(() => Education, (education) => education.seeker)
  educations: Education[];

  @OneToMany(() => Assessment, (assessment) => assessment.seeker)
  assessments: Assessment[];

  @OneToOne(() => CareerPreference, (preference) => preference.seeker)
  careerPreference?: CareerPreference;

  public static createForUser(userId: string): SeekerProfile {
    const profile = new SeekerProfile();
    profile.userId = userId;
    profile.profileCompleteness = 0;
    return profile;
  }

  /** Cache the SAKTI Lens output for fast dashboard render. N is kept raw. */
  public applyPsychometric(result: PsychometricResult): void {
    this.oceanScores = result.ocean.scores;
    this.oceanTraitConfidence = result.ocean.trait_confidence;
    this.oceanConfidence = result.ocean.confidence;
    this.riasecScores = result.riasec.scores;
    this.riasecRaw = result.riasec.raw;
    this.hollandCode = result.riasec.holland_code;
  }

  public isFoundationComplete(): boolean {
    return Boolean(
      this.gender && this.employmentStatus && this.educationLevel && this.field,
    );
  }

  public isAssessmentComplete(): boolean {
    return this.oceanScores != null && this.riasecScores != null;
  }

  /**
   * Profile completeness = share of the 4 onboarding sections filled in
   * (design doc §12). Skills/preference live in sibling tables, so their
   * presence is passed in by the caller.
   */
  public recomputeCompleteness(params: {
    hasSkills: boolean;
    hasPreference: boolean;
  }): void {
    const sectionsDone = [
      this.isFoundationComplete(),
      params.hasSkills,
      this.isAssessmentComplete(),
      params.hasPreference,
    ].filter(Boolean).length;

    this.profileCompleteness = Number(
      ((sectionsDone / ONBOARDING_SECTION_COUNT) * 100).toFixed(2),
    );
  }
}
