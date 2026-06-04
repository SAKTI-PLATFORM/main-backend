import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './abstract/base.entity';
import { SeekerProfile } from './seeker-profile.entity';

@Entity({ name: 'experiences' })
export class Experience extends BaseEntity {
  @Column({ name: 'seeker_id' })
  seekerId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  company?: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string | null;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => SeekerProfile, (profile) => profile.experiences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seeker_id' })
  seeker: SeekerProfile;
}
