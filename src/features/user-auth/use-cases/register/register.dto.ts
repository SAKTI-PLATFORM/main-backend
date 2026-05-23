import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty({ message: 'Full name tidak boleh kosong' })
  @IsString({ message: 'Full name harus berupa string' })
  fullName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    description: 'Password (minimal 8 karakter)',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;

  @ApiProperty({
    description: 'Confirmation password',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Confirmation password tidak boleh kosong' })
  @IsString({ message: 'Confirmation password harus berupa string' })
  confirmationPassword: string;

  @ApiProperty({
    description: 'Role pengguna',
    enum: UserRoleEnum,
    example: UserRoleEnum.JOB_SEEKER,
  })
  @IsNotEmpty({ message: 'Role tidak boleh kosong' })
  @IsEnum(UserRoleEnum, {
    message: 'Role tidak valid. Pilih JOB_SEEKER atau RECRUITER',
  })
  role: UserRoleEnum;
}
