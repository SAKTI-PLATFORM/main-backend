import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CompanyType, JobType, WorkMode } from 'src/domain/enums/seeker.enum';

export class SubmitVisionDto {
  @ApiProperty({ example: 'data_scientist' })
  @IsString()
  targetRole: string;

  @ApiProperty({ enum: WorkMode, isArray: true })
  @IsArray()
  @IsEnum(WorkMode, { each: true, message: 'Work mode tidak valid' })
  workModes: WorkMode[];

  @ApiProperty({ example: 1000000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ example: 15000000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ enum: CompanyType, isArray: true })
  @IsArray()
  @IsEnum(CompanyType, { each: true, message: 'Tipe perusahaan tidak valid' })
  companyTypes: CompanyType[];

  @ApiProperty({ enum: JobType, isArray: true })
  @IsArray()
  @IsEnum(JobType, { each: true, message: 'Tipe pekerjaan tidak valid' })
  jobTypes: JobType[];
}
