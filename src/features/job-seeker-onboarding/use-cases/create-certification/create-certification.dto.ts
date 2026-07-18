import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateCertificationDto {
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
