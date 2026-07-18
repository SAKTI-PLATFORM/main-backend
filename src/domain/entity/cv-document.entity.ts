import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { ParsedCvData } from './parsed-cv-data.entity';
import { User } from './user.entity';

@Entity({ name: 'cv_document' })
export class CvDocument {
  @PrimaryColumn({ name: 'cv_id', type: 'varchar', length: 255 })
  cvId!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber!: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'file_type', type: 'varchar', length: 100 })
  fileType!: string;

  @Column({ name: 'file_url', type: 'varchar', length: 2048 })
  fileUrl!: string;

  @Column({ name: 'upload_status', type: 'varchar', length: 50 })
  uploadStatus!: string;

  @Column({ name: 'parse_status', type: 'varchar', length: 50 })
  parseStatus!: string;

  @Column({ name: 'uploaded_at', type: 'datetime' })
  uploadedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => ParsedCvData, (parsed) => parsed.cvDocument)
  parsedData!: ParsedCvData[];

  @BeforeInsert()
  private setDefaults(): void {
    if (!this.cvId) this.cvId = uuidv7();
    if (!this.uploadedAt) this.uploadedAt = new Date();
  }
}
