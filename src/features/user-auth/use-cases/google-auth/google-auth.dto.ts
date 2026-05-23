import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token dari frontend',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsNotEmpty({ message: 'Google ID token tidak boleh kosong' })
  @IsString({ message: 'Google ID token harus berupa string' })
  idToken: string;

  @ApiPropertyOptional({
    description: 'Role untuk user baru (wajib jika belum terdaftar)',
    enum: UserRoleEnum,
    example: UserRoleEnum.JOB_SEEKER,
  })
  @IsOptional()
  @IsEnum(UserRoleEnum, { message: 'Role tidak valid. Pilih JOB_SEEKER atau RECRUITER' })
  role?: UserRoleEnum;
}
