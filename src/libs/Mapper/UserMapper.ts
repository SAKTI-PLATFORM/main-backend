import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';

export class UserMapper {
  static toProfileResponse(user: User): ProfileResponse {
    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber ?? null,
      photoUrl: user.photoUrl ?? null,
      domicile: user.domicile ?? null,
      professionalHeadline: user.jobseekerProfile?.professionalHeadline ?? null,
      linkedinUrl: user.jobseekerProfile?.linkedinUrl ?? null,
      profileSummary: user.jobseekerProfile?.profileSummary ?? null,
      roles: user.getRoleNames(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export class ProfileResponse {
  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  userId: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  fullName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({ nullable: true, example: '+6281234567890' })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true, example: 'https://example.com/photo.jpg' })
  photoUrl: string | null;

  @ApiProperty({ nullable: true, example: 'Jakarta' })
  domicile: string | null;

  @ApiProperty({ nullable: true, example: 'Software Engineer' })
  professionalHeadline: string | null;

  @ApiProperty({ nullable: true, example: 'linkedin.com/in/john' })
  linkedinUrl: string | null;

  @ApiProperty({ nullable: true })
  profileSummary: string | null;

  @ApiProperty({
    description: 'User roles',
    enum: UserRoleEnum,
    isArray: true,
    example: [UserRoleEnum.JOB_SEEKER],
  })
  roles: UserRoleEnum[];

  @ApiProperty({
    description: 'Account creation date',
    example: '2026-01-22T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update date',
    example: '2026-01-22T10:00:00.000Z',
  })
  updatedAt: Date;
}
