import { UserRoleEnum } from 'src/domain/enums/user-role.enum';

export interface ICurrentUser {
  userId: string;
  fullName: string;
  email: string;
  roles: UserRoleEnum[];
  uniqueKey?: string | null;
}
