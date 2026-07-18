import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SaktiCvParseResult {
  confidenceScore: number;
  personalInfo: SaktiPersonalInfo;
  educations: Array<Record<string, unknown>>;
  experiences: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  certifications: Array<Record<string, unknown>>;
  skills: Array<Record<string, unknown>>;
}

export interface SaktiPersonalInfo {
  fullName: string | null;
  professionalHeadline: string | null;
  email: string | null;
  phoneNumber: string | null;
  domicile: string | null;
  linkedinUrl: string | null;
  profileSummary: string | null;
}

interface SaktiDataResponse {
  status: string;
  message: string;
  data: Record<string, unknown>;
}

@Injectable()
export class SaktiAiClient {
  constructor(private readonly configService: ConfigService) {}

  async parseCvFile(file: Express.Multer.File): Promise<SaktiCvParseResult> {
    const baseUrl =
      this.configService.get<string>('app.saktiAi.url') ??
      'http://localhost:8001';

    let response: Response;
    try {
      const body = new FormData();
      body.append(
        'cv',
        new Blob([new Uint8Array(file.buffer)], { type: 'application/pdf' }),
        file.originalname,
      );

      response = await fetch(`${baseUrl.replace(/\/$/, '')}/ml/cv/parse-file`, {
        method: 'POST',
        body,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      throw new ServiceUnavailableException(
        `SAKTI-AI tidak bisa dihubungi: ${message}`,
      );
    }

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `SAKTI-AI gagal parsing CV: ${this.errorMessage(payload)}`,
      );
    }
    if (!this.isSaktiDataResponse(payload)) {
      throw new ServiceUnavailableException(
        'SAKTI-AI mengembalikan response parsing CV yang tidak valid',
      );
    }

    return this.mapParseResult(payload.data);
  }

  private mapParseResult(data: Record<string, unknown>): SaktiCvParseResult {
    const personalInfo = this.readRecord(data, 'personal_info');
    const camelPersonalInfo = this.readRecord(data, 'personalInfo');
    return {
      confidenceScore: this.readNumber(data, 'confidence_score') ?? 0,
      personalInfo: {
        fullName:
          this.readString(personalInfo, 'full_name') ??
          this.readString(camelPersonalInfo, 'fullName'),
        professionalHeadline:
          this.readString(personalInfo, 'professional_headline') ??
          this.readString(camelPersonalInfo, 'professionalHeadline'),
        email:
          this.readString(personalInfo, 'email') ??
          this.readString(camelPersonalInfo, 'email'),
        phoneNumber:
          this.readString(personalInfo, 'phone_number') ??
          this.readString(camelPersonalInfo, 'phoneNumber'),
        domicile:
          this.readString(personalInfo, 'domicile') ??
          this.readString(camelPersonalInfo, 'domicile'),
        linkedinUrl:
          this.readString(personalInfo, 'linkedin_url') ??
          this.readString(camelPersonalInfo, 'linkedinUrl'),
        profileSummary:
          this.readString(personalInfo, 'profile_summary') ??
          this.readString(camelPersonalInfo, 'profileSummary'),
      },
      educations: this.readRecordArray(data, 'educations'),
      experiences: this.readRecordArray(data, 'experiences'),
      projects: this.readRecordArray(data, 'projects'),
      certifications: this.readRecordArray(data, 'certifications'),
      skills: this.readRecordArray(data, 'skills'),
    };
  }

  private readRecord(
    source: Record<string, unknown>,
    key: string,
  ): Record<string, unknown> {
    const value = source[key];
    return this.isRecord(value) ? value : {};
  }

  private readString(
    source: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = source[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private isSaktiDataResponse(value: unknown): value is SaktiDataResponse {
    if (!this.isRecord(value)) return false;
    return (
      typeof value.status === 'string' &&
      typeof value.message === 'string' &&
      this.isRecord(value.data)
    );
  }

  private readRecordArray(
    source: Record<string, unknown>,
    key: string,
  ): Array<Record<string, unknown>> {
    const value = source[key];
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Record<string, unknown> =>
      this.isRecord(item),
    );
  }

  private readNumber(
    source: Record<string, unknown>,
    key: string,
  ): number | null {
    const value = source[key];
    return typeof value === 'number' ? value : null;
  }

  private errorMessage(payload: unknown): string {
    if (this.isRecord(payload)) {
      if (typeof payload.error === 'string') return payload.error;
      if (typeof payload.detail === 'string') return payload.detail;
      if (typeof payload.message === 'string') return payload.message;
    }
    return 'unknown error';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
