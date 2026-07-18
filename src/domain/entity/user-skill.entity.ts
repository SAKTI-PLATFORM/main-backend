import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { User } from './user.entity';

@Entity({ name: 'jobseeker_skills' })
export class UserSkill {
  @PrimaryColumn({ name: 'user_skill_id', type: 'char', length: 36 })
  userSkillId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ name: 'skill_id', type: 'char', length: 36 })
  skillId!: string;

  @Column({
    name: 'detected_text',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  detectedText?: string | null;

  @Column({ name: 'confidence_score', type: 'float', nullable: true })
  confidenceScore?: number | null;

  @Column({ name: 'learning_hours', type: 'float', nullable: true })
  learningHours?: number | null;

  @Column({ name: 'working_hours', type: 'float', nullable: true })
  workingHours?: number | null;

  @Column({
    name: 'evidence_source',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  evidenceSource?: string | null;

  @Column({
    name: 'evidence_strength',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  evidenceStrength?: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @BeforeInsert()
  private generateId(): void {
    if (!this.userSkillId) this.userSkillId = uuidv7();
  }
}
