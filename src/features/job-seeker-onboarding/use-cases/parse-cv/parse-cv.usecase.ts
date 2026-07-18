import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certification } from 'src/domain/entity/certification.entity';
import { CvDocument } from 'src/domain/entity/cv-document.entity';
import { Education } from 'src/domain/entity/education.entity';
import { Experience } from 'src/domain/entity/experience.entity';
import { ParsedCvData } from 'src/domain/entity/parsed-cv-data.entity';
import { Project } from 'src/domain/entity/project.entity';
import { UserSkill } from 'src/domain/entity/user-skill.entity';
import {
  EducationLevel,
  RecordSource,
} from 'src/domain/enums/record-source.enum';
import {
  SaktiAiClient,
  SaktiCvParseResult,
} from 'src/infrastructure/sakti-ai/sakti-ai.client';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import {
  ParseCvInsertedCountsResponse,
  ParseCvResponse,
} from '../onboarding.response';
import { ParseCvDto } from './parse-cv.dto';

@Injectable()
export class ParseCvUseCase {
  constructor(
    @InjectRepository(CvDocument)
    private readonly cvDocumentRepository: Repository<CvDocument>,
    @InjectRepository(ParsedCvData)
    private readonly parsedCvDataRepository: Repository<ParsedCvData>,
    @InjectRepository(Education)
    private readonly educationRepository: Repository<Education>,
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    @InjectRepository(UserSkill)
    private readonly skillRepository: Repository<UserSkill>,
    private readonly saktiAiClient: SaktiAiClient,
  ) {}

  async execute(userId: string, dto: ParseCvDto): Promise<ParseCvResponse> {
    const cvDocument = this.cvDocumentRepository.create({
      userId,
      versionNumber:
        dto.versionNumber ?? (await this.nextVersionNumber(userId)),
      fileName: dto.fileName,
      fileType: dto.fileType,
      fileUrl: dto.fileUrl,
      uploadStatus: 'UPLOADED',
      parseStatus: 'PARSING',
      uploadedAt: new Date(),
    });
    const savedCvDocument = await this.cvDocumentRepository.save(cvDocument);

    let parsedResult: SaktiCvParseResult;
    try {
      parsedResult = await this.saktiAiClient.parseCv({
        text: dto.rawText,
        fileName: dto.fileName,
      });
    } catch (error) {
      savedCvDocument.parseStatus = 'FAILED';
      await this.cvDocumentRepository.save(savedCvDocument);
      throw error;
    }

    const parsedCvData = await this.parsedCvDataRepository.save(
      this.parsedCvDataRepository.create({
        cvId: savedCvDocument.cvId,
        confidenceScore: parsedResult.confidenceScore,
        rawResultJson: JSON.stringify(parsedResult),
        parsedAt: new Date(),
      }),
    );

    const inserted = await this.persistParsedRecords(userId, parsedResult);
    savedCvDocument.parseStatus = 'PARSED';
    await this.cvDocumentRepository.save(savedCvDocument);

    return {
      cvId: savedCvDocument.cvId,
      parsedId: parsedCvData.parsedId,
      confidenceScore: parsedResult.confidenceScore,
      inserted,
      parsedResult,
    };
  }

  private async nextVersionNumber(userId: string): Promise<number> {
    const latest = await this.cvDocumentRepository.findOne({
      where: { userId },
      order: { versionNumber: 'DESC' },
    });
    return latest ? latest.versionNumber + 1 : 1;
  }

  private async persistParsedRecords(
    userId: string,
    parsedResult: SaktiCvParseResult,
  ): Promise<ParseCvInsertedCountsResponse> {
    const educations = await this.educationRepository.save(
      parsedResult.educations.map((item) =>
        this.educationRepository.create({
          userId,
          educationLevel: this.readEducationLevel(item, 'education_level'),
          institution: this.readString(item, 'institution'),
          major: this.readString(item, 'major'),
          degree:
            this.readString(item, 'degree') ??
            this.readString(item, 'education_level') ??
            'Unknown',
          startYear: this.readNumber(item, 'start_year'),
          endYear: this.readNumber(item, 'end_year'),
          gpa: this.readNumber(item, 'gpa'),
          isCurrent: this.readBoolean(item, 'is_current') ?? false,
          source: RecordSource.CV,
        }),
      ),
    );

    const experiences = await this.experienceRepository.save(
      parsedResult.experiences.map((item) =>
        this.experienceRepository.create({
          userId,
          title: this.readString(item, 'title') ?? 'Experience',
          organization: this.readString(item, 'organization') ?? 'Unknown',
          experienceType: this.readString(item, 'experience_type') ?? 'WORK',
          startDate: this.readDate(item, 'start_date'),
          endDate: this.readDate(item, 'end_date'),
          isCurrent: this.readBoolean(item, 'is_current') ?? false,
          durationMonths: this.readNumber(item, 'duration_months'),
          description: this.readString(item, 'description'),
          source: RecordSource.CV,
        }),
      ),
    );

    const projects = await this.projectRepository.save(
      parsedResult.projects.map((item) =>
        this.projectRepository.create({
          userId,
          projectName: this.readString(item, 'project_name') ?? 'Project',
          description: this.readString(item, 'description'),
          toolsUsed: this.readString(item, 'tools_used'),
          startDate: this.readDate(item, 'start_date'),
          endDate: this.readDate(item, 'end_date'),
          source: RecordSource.CV,
        }),
      ),
    );

    const certifications = await this.certificationRepository.save(
      parsedResult.certifications.map((item) =>
        this.certificationRepository.create({
          userId,
          certificationName:
            this.readString(item, 'certification_name') ?? 'Certification',
          issuer: this.readString(item, 'issuer') ?? 'Unknown',
          issuedYear: this.readNumber(item, 'issued_year'),
          certificateUrl: this.readString(item, 'certificate_url'),
          source: RecordSource.CV,
        }),
      ),
    );

    const skills = await this.skillRepository.save(
      parsedResult.skills.map((item) =>
        this.skillRepository.create({
          userId,
          skillId: uuidv7(),
          detectedText: this.readString(item, 'detected_text'),
          inferredLevel: this.readString(item, 'inferred_level'),
          confidenceScore: this.readNumber(item, 'confidence_score'),
          evidenceSource: this.readString(item, 'evidence_source') ?? 'cv_text',
          evidenceStrength: this.readString(item, 'evidence_strength'),
        }),
      ),
    );

    return {
      educations: educations.length,
      experiences: experiences.length,
      projects: projects.length,
      certifications: certifications.length,
      skills: skills.length,
    };
  }

  private readString(
    source: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = source[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private readNumber(
    source: Record<string, unknown>,
    key: string,
  ): number | null {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private readBoolean(
    source: Record<string, unknown>,
    key: string,
  ): boolean | null {
    const value = source[key];
    return typeof value === 'boolean' ? value : null;
  }

  private readDate(
    source: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = this.readString(source, key);
    if (!value) return null;
    if (/^\d{4}$/.test(value)) return `${value}-01-01`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return null;
  }

  private readEducationLevel(
    source: Record<string, unknown>,
    key: string,
  ): EducationLevel | null {
    const value = this.readString(source, key);
    if (!value) return null;
    return Object.values(EducationLevel).includes(value as EducationLevel)
      ? (value as EducationLevel)
      : null;
  }
}
