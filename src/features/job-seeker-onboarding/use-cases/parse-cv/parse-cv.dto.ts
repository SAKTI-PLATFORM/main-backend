import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class ParseCvDto {
  @ApiProperty({ example: 'cv-anargya.pdf' })
  @IsString()
  @MinLength(1)
  fileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MinLength(1)
  fileType!: string;

  @ApiProperty({ example: 'https://storage.example.com/cv-anargya.pdf' })
  @IsString()
  @MinLength(1)
  fileUrl!: string;

  @ApiProperty({
    description: 'Plain text content extracted from the CV file for SAKTI-AI.',
  })
  @IsString()
  @MinLength(1)
  rawText!: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  versionNumber?: number;
}
