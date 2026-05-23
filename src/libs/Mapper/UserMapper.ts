import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';

export class UserMapper {
  static toProfileResponse(user: User): ProfileResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.getRoleNames(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export class ProfileResponse {
  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

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
