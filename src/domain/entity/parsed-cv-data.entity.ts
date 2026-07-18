import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { CvDocument } from './cv-document.entity';

@Entity({ name: 'parsed_cv_data' })
export class ParsedCvData {
  @PrimaryColumn({ name: 'parsed_id', type: 'char', length: 36 })
  parsedId!: string;

  @Column({ name: 'cv_id', type: 'varchar', length: 255 })
  cvId!: string;

  @Column({ name: 'confidence_score', type: 'float', nullable: true })
  confidenceScore?: number | null;

  @Column({ name: 'raw_result_json', type: 'longtext' })
  rawResultJson!: string;

  @Column({ name: 'parsed_at', type: 'datetime' })
  parsedAt!: Date;

  @ManyToOne(() => CvDocument, (cv) => cv.parsedData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cv_id' })
  cvDocument!: CvDocument;

  @BeforeInsert()
  private setDefaults(): void {
    if (!this.parsedId) this.parsedId = uuidv7();
    if (!this.parsedAt) this.parsedAt = new Date();
  }
}
