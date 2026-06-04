import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EducationLevel } from '../enums/seeker.enum';
import { BaseEntity } from './abstract/base.entity';
import { SeekerProfile } from './seeker-profile.entity';

@Entity({ name: 'educations' })
export class Education extends BaseEntity {
  @Column({ name: 'seeker_id' })
  seekerId: string;

  @Column({ type: 'enum', enum: EducationLevel, nullable: true })
  degree?: EducationLevel | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  major?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  institution?: string | null;

  @Column({ type: 'int', nullable: true })
  year?: number | null;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  gpa?: number | null;

  @ManyToOne(() => SeekerProfile, (profile) => profile.educations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seeker_id' })
  seeker: SeekerProfile;
}
