/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { User } from 'src/domain/entity/user.entity';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { DataResponse } from 'src/infrastructure/core/http/http-response';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from '../../../utils/create-testing-app.utils';
import {
  clearDatabase,
  createTestDatabase,
  dropTestDatabase,
  generateTestDatabaseName,
} from '../../../utils/testing-database.utils';

describe('Register (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;
  let dataSource: DataSource;
  const testDatabaseName = generateTestDatabaseName();

  beforeAll(async () => {
    await createTestDatabase(testDatabaseName);
    app = await createTestingApp(testDatabaseName);
    dataSource = app.get<DataSource>(DataSource);
    requestTestAgent = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
    await dropTestDatabase(testDatabaseName);
  });

  afterEach(async () => {
    await clearDatabase(app);
  });

  describe('POST /auth/register', () => {
    it('should register successfully as Job Seeker and return token', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(201);

      const body = response.body as DataResponse<IAuthToken>;
      expect(body).toHaveProperty('statusCode', 201);
      expect(body).toHaveProperty('message', 'Registrasi berhasil');
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('token');
      expect(typeof body.data.token).toBe('string');
    });

    it('should register successfully as Recruiter and return token', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'Jane Recruiter',
          email: 'jane.recruiter@example.com',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: UserRoleEnum.RECRUITER,
        })
        .expect(201);

      const body = response.body as DataResponse<IAuthToken>;
      expect(body).toHaveProperty('statusCode', 201);
      expect(body.data).toHaveProperty('token');
    });

    it('should store the token in activeToken field after successful registration', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(201);

      const body = response.body as DataResponse<IAuthToken>;
      const user = await dataSource.manager.findOne(User, {
        where: { email: 'john.doe@example.com' },
      });

      expect(user?.activeToken).toBe(body.data.token);
    });

    it('should return 409 when email already exists', async () => {
      await requestTestAgent.post('/auth/register').send({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmationPassword: 'Password123!',
        role: UserRoleEnum.JOB_SEEKER,
      });

      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'Another John',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(409);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 409);
      expect(body).toHaveProperty('error', 'Email sudah terdaftar');
    });

    it('should return 400 when password and confirmationPassword do not match', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmationPassword: 'DifferentPassword!',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when password is shorter than 8 characters', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'short',
          confirmationPassword: 'short',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'invalid-email',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when role is invalid', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: 'INVALID_ROLE',
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when fullName is missing', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when email is missing', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
          role: UserRoleEnum.JOB_SEEKER,
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when role is missing', async () => {
      const response = await requestTestAgent
        .post('/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmationPassword: 'Password123!',
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });
  });
});
