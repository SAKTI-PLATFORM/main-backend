import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { RecordSource } from 'src/domain/enums/record-source.enum';

export class CreateCertificationDto {
  @ApiProperty({ enum: RecordSource, required: false })
  @IsOptional()
  @IsEnum(RecordSource)
  source?: RecordSource;

  @ApiProperty()
  @IsString()
  certificationName!: string;

  @ApiProperty()
  @IsString()
  issuer!: string;

  @ApiProperty({ required: false, example: 2025 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  issuedYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  certificateUrl?: string;
}
