import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AssessmentInstrument } from '../enums/seeker.enum';
import { BaseEntity } from './abstract/base.entity';
import { SeekerProfile } from './seeker-profile.entity';

@Entity({ name: 'assessments' })
export class Assessment extends BaseEntity {
  @Column({ name: 'seeker_id' })
  seekerId: string;

  @Column({ type: 'enum', enum: AssessmentInstrument })
  instrument: AssessmentInstrument;

  /** Raw responses, re-scorable if the formula changes. */
  @Column({ type: 'json' })
  responses: unknown;

  /** Computed scores cached for fast reads. */
  @Column({ type: 'json', nullable: true })
  scores?: unknown;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence?: number | null;

  @ManyToOne(() => SeekerProfile, (profile) => profile.assessments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seeker_id' })
  seeker: SeekerProfile;
}
