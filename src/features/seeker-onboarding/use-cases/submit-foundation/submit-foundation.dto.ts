import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import {
  EducationLevel,
  EmploymentStatus,
  FieldOfInterest,
  Gender,
} from 'src/domain/enums/seeker.enum';

export class SubmitFoundationDto {
  @ApiProperty({ example: '+62 812 345 678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiProperty({ example: '1999-05-12', required: false, description: 'YYYY-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD' })
  dob?: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender, { message: 'Gender tidak valid' })
  gender: Gender;

  @ApiProperty({ enum: EmploymentStatus })
  @IsEnum(EmploymentStatus, { message: 'Status pekerjaan tidak valid' })
  employmentStatus: EmploymentStatus;

  @ApiProperty({ enum: EducationLevel })
  @IsEnum(EducationLevel, { message: 'Jenjang pendidikan tidak valid' })
  educationLevel: EducationLevel;

  @ApiProperty({ enum: FieldOfInterest })
  @IsEnum(FieldOfInterest, { message: 'Bidang tidak valid' })
  field: FieldOfInterest;
}
