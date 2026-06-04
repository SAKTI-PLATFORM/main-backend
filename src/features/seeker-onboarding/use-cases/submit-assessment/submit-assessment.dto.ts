import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  OceanTraitKey,
  RiasecTypeKey,
} from 'src/domain/types/psychometric.type';

export class OceanResponseDto {
  @ApiProperty({ enum: ['O', 'C', 'E', 'A', 'N'] })
  @IsIn(['O', 'C', 'E', 'A', 'N'])
  trait: OceanTraitKey;

  @ApiProperty({ enum: ['+', '-'] })
  @IsIn(['+', '-'])
  polarity: '+' | '-';

  @ApiProperty({ minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  value: number;
}

export class RiasecResponseDto {
  @ApiProperty({ minimum: 1, maximum: 42 })
  @IsInt()
  @Min(1)
  @Max(42)
  item: number;

  @ApiProperty({ enum: ['R', 'I', 'A', 'S', 'E', 'C'], required: false })
  @IsOptional()
  @IsIn(['R', 'I', 'A', 'S', 'E', 'C'])
  letter?: RiasecTypeKey;

  @ApiProperty()
  @IsBoolean()
  agreed: boolean;
}

export class SubmitAssessmentDto {
  @ApiProperty({ type: [OceanResponseDto], description: 'BFI-10: 10 item' })
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => OceanResponseDto)
  oceanResponses: OceanResponseDto[];

  @ApiProperty({ type: [RiasecResponseDto], description: 'RIASEC: 42 item' })
  @IsArray()
  @ArrayMinSize(42)
  @ArrayMaxSize(42)
  @ValidateNested({ each: true })
  @Type(() => RiasecResponseDto)
  riasecResponses: RiasecResponseDto[];
}
