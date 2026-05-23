import { SetMetadata } from '@nestjs/common';
import { AuthDecoratorEnum } from '../enums/auth.enum';

/**
 * Decorator to specify required roles for accessing a route.
 * @param roles - An array of roles required to access the route.
 * @example
 * @RequireRole('JOB_SEEKER', 'RECRUITER')
 * @RequireRole('ANY') // allows any authenticated user
 */
export const RequireRole = (
  ...roles: string[]
): ReturnType<typeof SetMetadata> =>
  SetMetadata(AuthDecoratorEnum.ROLES_KEY, roles);
