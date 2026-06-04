import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { CompanyType, JobType, WorkMode } from '../enums/seeker.enum';
import { BaseEntity } from './abstract/base.entity';
import { SeekerProfile } from './seeker-profile.entity';

/**
 * Step 04 "Your Vision" — these become hard constraints (gate) in the Matchmaker,
 * not semantic-similarity features.
 */
@Entity({ name: 'career_preferences' })
export class CareerPreference extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'seeker_id' })
  seekerId: string;

  @Column({ name: 'target_role', type: 'varchar', length: 150, nullable: true })
  targetRole?: string | null;

  @Column({ name: 'salary_min', type: 'int', nullable: true })
  salaryMin?: number | null;

  @Column({ name: 'salary_max', type: 'int', nullable: true })
  salaryMax?: number | null;

  @Column({ name: 'work_modes', type: 'json', nullable: true })
  workModes?: WorkMode[] | null;

  @Column({ name: 'company_types', type: 'json', nullable: true })
  companyTypes?: CompanyType[] | null;

  @Column({ name: 'job_types', type: 'json', nullable: true })
  jobTypes?: JobType[] | null;

  @OneToOne(() => SeekerProfile, (profile) => profile.careerPreference, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seeker_id' })
  seeker: SeekerProfile;
}
