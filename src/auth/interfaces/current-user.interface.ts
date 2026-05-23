import { UserRoleEnum } from 'src/domain/enums/user-role.enum';

export interface ICurrentUser {
  id: string;
  username: string;
  email: string;
  roles: UserRoleEnum[];
  uniqueKey?: string | null;
}
