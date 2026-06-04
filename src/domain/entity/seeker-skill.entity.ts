import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { SkillCategory, SkillSource } from '../enums/seeker.enum';
import { BaseEntity } from './abstract/base.entity';
import { SeekerProfile } from './seeker-profile.entity';

@Entity({ name: 'seeker_skills' })
@Index(['seekerId', 'name', 'source'], { unique: true })
export class SeekerSkill extends BaseEntity {
  @Column({ name: 'seeker_id' })
  seekerId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'enum', enum: SkillCategory })
  category: SkillCategory;

  @Column({ type: 'enum', enum: SkillSource })
  source: SkillSource;

  /** 0..1 self/CV proficiency signal. */
  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  proficiency?: number | null;

  /** 0..1 confidence (CV evidence > self-declared). */
  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  confidence?: number | null;

  @Column({ name: 'hours_estimate', type: 'int', nullable: true })
  hoursEstimate?: number | null;

  @Column({ type: 'text', nullable: true })
  evidence?: string | null;

  @ManyToOne(() => SeekerProfile, (profile) => profile.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seeker_id' })
  seeker: SeekerProfile;
}
