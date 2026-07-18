import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { RecordSource } from '../enums/record-source.enum';
import { ITimestamp } from './abstract/timestamp.entity';
import { User } from './user.entity';

@Entity({ name: 'experience' })
export class Experience extends ITimestamp {
  @PrimaryColumn({ name: 'experience_id', type: 'char', length: 36 })
  experienceId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  organization!: string;

  @Column({ name: 'experience_type', type: 'varchar', length: 100 })
  experienceType!: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string | null;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ name: 'duration_months', type: 'int', nullable: true })
  durationMonths?: number | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: RecordSource })
  source!: RecordSource;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @BeforeInsert()
  private generateId(): void {
    if (!this.experienceId) this.experienceId = uuidv7();
  }
}
