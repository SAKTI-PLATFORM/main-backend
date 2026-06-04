import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ToolsExperience } from 'src/domain/enums/seeker.enum';

/** A declared tool paired with how long the seeker has used it (key-value). */
export class ToolEntryDto {
  @ApiProperty({ example: 'python' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ToolsExperience, required: false })
  @IsOptional()
  @IsEnum(ToolsExperience, { message: 'Pengalaman tools tidak valid' })
  experience?: ToolsExperience;
}

export class SubmitExpertiseDto {
  @ApiProperty({
    type: [ToolEntryDto],
    description: 'Tools + lama pengalaman per tool',
    example: [
      { name: 'python', experience: '3-5y' },
      { name: 'figma', experience: '6-12m' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToolEntryDto)
  tools: ToolEntryDto[];

  @ApiProperty({ type: [String], example: ['data_analysis', 'uiux_design'] })
  @IsArray()
  @IsString({ each: true })
  knowledgeAreas: string[];

  @ApiProperty({
    type: [String],
    description: 'Soft skills urut prioritas 1..5 (1 paling kuat)',
    example: ['leadership', 'communication', 'critical_thinking'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  softSkillsRanked: string[];
}
