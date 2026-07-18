import { ApiProperty } from '@nestjs/swagger';
import { SaktiCvParseResult } from 'src/infrastructure/sakti-ai/sakti-ai.client';

export class OnboardingRecordResponse {
  @ApiProperty()
  id!: string;
}

export class ParseCvInsertedCountsResponse {
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

  @ApiProperty({ type: ParseCvInsertedCountsResponse })
  inserted!: ParseCvInsertedCountsResponse;

  parsedResult!: SaktiCvParseResult;
}
