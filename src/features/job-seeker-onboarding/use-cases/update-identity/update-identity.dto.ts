import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateIdentityDto {
  @ApiProperty({ example: 'Anargya Isadhi Maheswara' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ example: 'anargya@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    required: false,
    example: 'Software Engineer & AI Enthusiast',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  professionalHeadline?: string;

  @ApiProperty({ required: false, example: '+62 812-3456-7890' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiProperty({ required: false, example: 'Bogor, Indonesia' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domicile?: string;

  @ApiProperty({ required: false, example: 'linkedin.com/in/anargya' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  linkedinUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  profileSummary?: string;
}
