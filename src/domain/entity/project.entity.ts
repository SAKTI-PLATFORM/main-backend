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

@Entity({ name: 'project' })
export class Project extends ITimestamp {
  @PrimaryColumn({ name: 'project_id', type: 'char', length: 36 })
  projectId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ name: 'project_name', type: 'varchar', length: 255 })
  projectName!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'tools_used', type: 'varchar', length: 1000, nullable: true })
  toolsUsed?: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string | null;

  @Column({ type: 'enum', enum: RecordSource })
  source!: RecordSource;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @BeforeInsert()
  private generateId(): void {
    if (!this.projectId) this.projectId = uuidv7();
  }
}
