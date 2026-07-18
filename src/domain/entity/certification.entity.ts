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

@Entity({ name: 'certification' })
export class Certification extends ITimestamp {
  @PrimaryColumn({ name: 'certification_id', type: 'char', length: 36 })
  certificationId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ name: 'certification_name', type: 'varchar', length: 255 })
  certificationName!: string;

  @Column({ type: 'varchar', length: 255 })
  issuer!: string;

  @Column({ name: 'issued_year', type: 'int', nullable: true })
  issuedYear?: number | null;

  @Column({
    name: 'certificate_url',
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  certificateUrl?: string | null;

  @Column({ type: 'enum', enum: RecordSource })
  source!: RecordSource;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @BeforeInsert()
  private generateId(): void {
    if (!this.certificationId) this.certificationId = uuidv7();
  }
}
