import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CvDocument } from 'src/domain/entity/cv-document.entity';
import { JobseekerProfile } from 'src/domain/entity/jobseeker-profile.entity';
import { ParsedCvData } from 'src/domain/entity/parsed-cv-data.entity';
import { User } from 'src/domain/entity/user.entity';
import {
  SaktiAiClient,
  SaktiCvParseResult,
} from 'src/infrastructure/sakti-ai/sakti-ai.client';
import { Repository } from 'typeorm';
import {
  ParseCvDetectedCountsResponse,
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(JobseekerProfile)
    private readonly profileRepository: Repository<JobseekerProfile>,
    private readonly saktiAiClient: SaktiAiClient,
  ) {}

  async execute(
    userId: string,
    cv: Express.Multer.File,
    dto: ParseCvDto,
  ): Promise<ParseCvResponse> {
    const cvDocument = this.cvDocumentRepository.create({
      userId,
      versionNumber:
        dto.versionNumber ?? (await this.nextVersionNumber(userId)),
      fileName: cv.originalname,
      fileType: cv.mimetype,
      fileUrl: `backend-upload://${encodeURIComponent(cv.originalname)}`,
      uploadStatus: 'UPLOADED',
      parseStatus: 'PARSING',
      uploadedAt: new Date(),
    });
    const savedCvDocument = await this.cvDocumentRepository.save(cvDocument);

    let parsedResult: SaktiCvParseResult;
    try {
      parsedResult = await this.saktiAiClient.parseCvFile(cv);
      parsedResult = await this.withAccountFallback(userId, parsedResult);
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

    const detected = this.countDetectedRecords(parsedResult);
    savedCvDocument.parseStatus = 'PARSED';
    await this.cvDocumentRepository.save(savedCvDocument);

    return {
      cvId: savedCvDocument.cvId,
      parsedId: parsedCvData.parsedId,
      confidenceScore: parsedResult.confidenceScore,
      detected,
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

  private async withAccountFallback(
    userId: string,
    parsedResult: SaktiCvParseResult,
  ): Promise<SaktiCvParseResult> {
    const [user, profile] = await Promise.all([
      this.userRepository.findOne({ where: { userId } }),
      this.profileRepository.findOne({ where: { userId } }),
    ]);
    return {
      ...parsedResult,
      personalInfo: {
        fullName: parsedResult.personalInfo.fullName ?? user?.fullName ?? null,
        email: parsedResult.personalInfo.email ?? user?.email ?? null,
        phoneNumber:
          parsedResult.personalInfo.phoneNumber ?? user?.phoneNumber ?? null,
        domicile:
          parsedResult.personalInfo.domicile ??
          user?.domicile ??
          profile?.domicile ??
          null,
        professionalHeadline:
          parsedResult.personalInfo.professionalHeadline ??
          profile?.professionalHeadline ??
          null,
        linkedinUrl:
          parsedResult.personalInfo.linkedinUrl ?? profile?.linkedinUrl ?? null,
        profileSummary:
          parsedResult.personalInfo.profileSummary ??
          profile?.profileSummary ??
          null,
      },
    };
  }

  private countDetectedRecords(
    parsedResult: SaktiCvParseResult,
  ): ParseCvDetectedCountsResponse {
    return {
      educations: parsedResult.educations.length,
      experiences: parsedResult.experiences.length,
      projects: parsedResult.projects.length,
      certifications: parsedResult.certifications.length,
      skills: parsedResult.skills.length,
    };
  }
}
