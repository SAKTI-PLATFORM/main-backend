import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RecordSource } from 'src/domain/enums/record-source.enum';

export class CreateProjectDto {
  @ApiProperty({ enum: RecordSource, required: false })
  @IsOptional()
  @IsEnum(RecordSource)
  source?: RecordSource;

  @ApiProperty()
  @IsString()
  projectName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  toolsUsed?: string;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
