import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { EducationLevel, RecordSource } from '../enums/record-source.enum';
import { ITimestamp } from './abstract/timestamp.entity';
import { User } from './user.entity';

@Entity({ name: 'education' })
export class Education extends ITimestamp {
  @PrimaryColumn({ name: 'education_id', type: 'char', length: 36 })
  educationId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({
    name: 'education_level',
    type: 'enum',
    enum: EducationLevel,
    nullable: true,
  })
  educationLevel?: EducationLevel | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  institution?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  major?: string | null;

  @Column({ type: 'varchar', length: 255 })
  degree!: string;

  @Column({ name: 'start_year', type: 'int', nullable: true })
  startYear?: number | null;

  @Column({ name: 'end_year', type: 'int', nullable: true })
  endYear?: number | null;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  gpa?: number | null;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ type: 'enum', enum: RecordSource })
  source!: RecordSource;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @BeforeInsert()
  private generateId(): void {
    if (!this.educationId) this.educationId = uuidv7();
  }
}
