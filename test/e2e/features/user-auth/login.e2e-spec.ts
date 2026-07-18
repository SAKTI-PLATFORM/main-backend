/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { User } from 'src/domain/entity/user.entity';
import { DataResponse } from 'src/infrastructure/core/http/http-response';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from '../../../utils/create-testing-app.utils';
import {
  createJobSeekerUser,
  createRecruiterUser,
  defaultJobSeekerCredentials,
  defaultRecruiterCredentials,
} from '../../../utils/test-helpers.utils';
import {
  clearDatabase,
  createTestDatabase,
  dropTestDatabase,
  generateTestDatabaseName,
} from '../../../utils/testing-database.utils';

describe('Login (e2e)', () => {
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

  describe('POST /auth/login', () => {
    it('should login successfully as Job Seeker with valid credentials', async () => {
      await createJobSeekerUser(dataSource);

      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          email: defaultJobSeekerCredentials.email,
          password: defaultJobSeekerCredentials.password,
        })
        .expect(200);

      const body = response.body as DataResponse<IAuthToken>;
      expect(body).toHaveProperty('statusCode', 200);
      expect(body).toHaveProperty('message', 'Login berhasil');
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('token');
      expect(typeof body.data.token).toBe('string');
    });

    it('should login successfully as Recruiter with valid credentials', async () => {
      await createRecruiterUser(dataSource);

      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          email: defaultRecruiterCredentials.email,
          password: defaultRecruiterCredentials.password,
        })
        .expect(200);

      const body = response.body as DataResponse<IAuthToken>;
      expect(body).toHaveProperty('statusCode', 200);
      expect(body).toHaveProperty('message', 'Login berhasil');
      expect(body.data).toHaveProperty('token');
    });

    it('should return 401 when email does not exist', async () => {
      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
      expect(body).toHaveProperty('error', 'Email atau password salah');
    });

    it('should return 401 when password is incorrect', async () => {
      await createJobSeekerUser(dataSource);

      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          email: defaultJobSeekerCredentials.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
      expect(body).toHaveProperty('error', 'Email atau password salah');
    });

    it('should return 401 when user registered via Google tries to login with password', async () => {
      const googleUser = dataSource.manager.create(User, {
        fullName: 'Google User',
        email: 'googleuser@example.com',
        googleId: 'google-sub-12345',
        passwordHash: null,
      });
      await dataSource.manager.save(googleUser);

      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          email: 'googleuser@example.com',
          password: 'Password123!',
        })
        .expect(401);

      const body = response.body as { statusCode: number; error: string };
      expect(body).toHaveProperty('statusCode', 401);
      expect(body.error).toContain('Google');
    });

    it('should return 400 when email is missing', async () => {
      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          password: 'Password123!',
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when password is missing', async () => {
      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          email: defaultJobSeekerCredentials.email,
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await requestTestAgent
        .post('/auth/login')
        .send({
          email: 'invalid-email-format',
          password: 'Password123!',
        })
        .expect(400);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 400);
    });

    it('should issue a unique token on subsequent logins', async () => {
      await createJobSeekerUser(dataSource);

      const firstResponse = await requestTestAgent
        .post('/auth/login')
        .send({
          email: defaultJobSeekerCredentials.email,
          password: defaultJobSeekerCredentials.password,
        })
        .expect(200);

      const secondResponse = await requestTestAgent
        .post('/auth/login')
        .send({
          email: defaultJobSeekerCredentials.email,
          password: defaultJobSeekerCredentials.password,
        })
        .expect(200);

      const firstBody = firstResponse.body as DataResponse<IAuthToken>;
      const secondBody = secondResponse.body as DataResponse<IAuthToken>;

      expect(secondBody.data.token).not.toBe(firstBody.data.token);
    });
  });
});
