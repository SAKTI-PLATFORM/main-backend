import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { DataResponse } from 'src/infrastructure/core/http/http-response';
import { UserRole } from 'src/domain/entity/user-role.entity';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import TestAgent from 'supertest/lib/agent';
import { DataSource } from 'typeorm';

export const defaultJobSeekerCredentials = {
  fullName: 'Test Job Seeker',
  email: 'testjobseeker@example.com',
  password: 'TestPassword123!',
};

export const defaultRecruiterCredentials = {
  fullName: 'Test Recruiter',
  email: 'testrecruiter@example.com',
  password: 'TestPassword123!',
};

export async function createJobSeekerUser(
  dataSource: DataSource,
  credentials: { fullName: string; email: string; password: string } = defaultJobSeekerCredentials,
): Promise<User> {
  const hashedPassword = await PasswordHasher.hash(credentials.password);

  const user = dataSource.manager.create(User, {
    username: credentials.fullName,
    email: credentials.email,
    hashedPassword,
  });
  const savedUser = await dataSource.manager.save(user);

  const userRole = dataSource.manager.create(UserRole, {
    userId: savedUser.id,
    roleName: UserRoleEnum.JOB_SEEKER,
  });
  await dataSource.manager.save(userRole);

  return savedUser;
}

export async function createRecruiterUser(
  dataSource: DataSource,
  credentials: { fullName: string; email: string; password: string } = defaultRecruiterCredentials,
): Promise<User> {
  const hashedPassword = await PasswordHasher.hash(credentials.password);

  const user = dataSource.manager.create(User, {
    username: credentials.fullName,
    email: credentials.email,
    hashedPassword,
  });
  const savedUser = await dataSource.manager.save(user);

  const userRole = dataSource.manager.create(UserRole, {
    userId: savedUser.id,
    roleName: UserRoleEnum.RECRUITER,
  });
  await dataSource.manager.save(userRole);

  return savedUser;
}

export async function loginAsJobSeeker(
  requestTestAgent: TestAgent,
  credentials: { email: string; password: string } = defaultJobSeekerCredentials,
): Promise<string> {
  const response = await requestTestAgent.post('/auth/login').send({
    email: credentials.email,
    password: credentials.password,
  });

  const body = response.body as DataResponse<IAuthToken>;
  return body.data.token;
}

export async function loginAsRecruiter(
  requestTestAgent: TestAgent,
  credentials: { email: string; password: string } = defaultRecruiterCredentials,
): Promise<string> {
  const response = await requestTestAgent.post('/auth/login').send({
    email: credentials.email,
    password: credentials.password,
  });

  const body = response.body as DataResponse<IAuthToken>;
  return body.data.token;
}
