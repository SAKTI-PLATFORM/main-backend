import { ApiProperty } from '@nestjs/swagger';
import { SaktiCvParseResult } from 'src/infrastructure/sakti-ai/sakti-ai.client';

export class OnboardingRecordResponse {
  @ApiProperty()
  id!: string;
}

export class IdentityResponse {
  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  phoneNumber!: string | null;

  @ApiProperty({ nullable: true })
  domicile!: string | null;

  @ApiProperty({ nullable: true })
  professionalHeadline!: string | null;

  @ApiProperty({ nullable: true })
  linkedinUrl!: string | null;

  @ApiProperty({ nullable: true })
  profileSummary!: string | null;
}

export class ParseCvDetectedCountsResponse {
  @ApiProperty()
  educations!: number;

  @ApiProperty()
  experiences!: number;

  @ApiProperty()
  projects!: number;

  @ApiProperty()
  certifications!: number;

  @ApiProperty()
  skills!: number;
}

export class ParseCvResponse {
  @ApiProperty()
  cvId!: string;

  @ApiProperty()
  parsedId!: string;

  @ApiProperty()
  confidenceScore!: number;

  @ApiProperty({ type: ParseCvDetectedCountsResponse })
  detected!: ParseCvDetectedCountsResponse;

  parsedResult!: SaktiCvParseResult;
}
