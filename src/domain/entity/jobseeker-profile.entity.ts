import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ITimestamp } from './abstract/timestamp.entity';
import { User } from './user.entity';

@Entity({ name: 'jobseeker_profile' })
export class JobseekerProfile extends ITimestamp {
  @PrimaryColumn({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domicile?: string | null;

  @Column({
    name: 'professional_headline',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  professionalHeadline?: string | null;

  @Column({
    name: 'linkedin_url',
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  linkedinUrl?: string | null;

  @Column({ name: 'profile_summary', type: 'text', nullable: true })
  profileSummary?: string | null;

  @OneToOne(() => User, (user) => user.jobseekerProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
