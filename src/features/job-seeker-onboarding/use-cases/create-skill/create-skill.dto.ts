import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skillId?: string;

  @ApiProperty()
  @IsString()
  detectedText!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore?: number;

  @ApiProperty({ required: false, minimum: 0, example: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  learningHours?: number;

  @ApiProperty({ required: false, minimum: 0, example: 480 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  workingHours?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  evidenceSource?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  evidenceStrength?: string;
}
