import { UserRoleEnum } from 'src/domain/enums/user-role.enum';

export enum AuthDecoratorEnum {
  ROLES_KEY = 'roles',
}

export enum AuthRoleEnum {
  JOB_SEEKER = UserRoleEnum.JOB_SEEKER,
  RECRUITER = UserRoleEnum.RECRUITER,
  ANY = 'any',
}

export const AUTH_REQUEST_USER_KEY = 'user';
