import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RecordSource } from 'src/domain/enums/record-source.enum';

export class CreateExperienceDto {
  @ApiProperty({ enum: RecordSource, required: false })
  @IsOptional()
  @IsEnum(RecordSource)
  source?: RecordSource;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  organization!: string;

  @ApiProperty({ example: 'WORK' })
  @IsString()
  experienceType!: string;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMonths?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
