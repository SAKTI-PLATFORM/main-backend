/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { UserRoleEnum } from 'src/domain/enums/user-role.enum';
import { DataResponse } from 'src/infrastructure/core/http/http-response';
import { ProfileResponse } from 'src/libs/Mapper/UserMapper';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from '../../../utils/create-testing-app.utils';
import {
  createJobSeekerUser,
  createRecruiterUser,
  defaultJobSeekerCredentials,
  defaultRecruiterCredentials,
  loginAsJobSeeker,
  loginAsRecruiter,
} from '../../../utils/test-helpers.utils';
import {
  clearDatabase,
  createTestDatabase,
  dropTestDatabase,
  generateTestDatabaseName,
} from '../../../utils/testing-database.utils';

describe('Get Profile (e2e)', () => {
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

  describe('GET /auth/me', () => {
    it('should return Job Seeker profile with correct data', async () => {
      const user = await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      const response = await requestTestAgent
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as DataResponse<ProfileResponse>;
      expect(body).toHaveProperty('statusCode', 200);
      expect(body).toHaveProperty('message', 'Profil berhasil diambil');
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id', user.id);
      expect(body.data).toHaveProperty(
        'email',
        defaultJobSeekerCredentials.email,
      );
      expect(body.data).toHaveProperty('roles');
      expect(body.data.roles).toContain(UserRoleEnum.JOB_SEEKER);
    });

    it('should return Recruiter profile with correct data', async () => {
      const user = await createRecruiterUser(dataSource);
      const token = await loginAsRecruiter(requestTestAgent);

      const response = await requestTestAgent
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as DataResponse<ProfileResponse>;
      expect(body).toHaveProperty('statusCode', 200);
      expect(body.data).toHaveProperty('id', user.id);
      expect(body.data).toHaveProperty(
        'email',
        defaultRecruiterCredentials.email,
      );
      expect(body.data.roles).toContain(UserRoleEnum.RECRUITER);
    });

    it('should return profile with all required fields', async () => {
      await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      const response = await requestTestAgent
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as DataResponse<ProfileResponse>;
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('username');
      expect(body.data).toHaveProperty('email');
      expect(body.data).toHaveProperty('roles');
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await requestTestAgent.get('/auth/me').expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await requestTestAgent
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 when token format is incorrect (missing Bearer prefix)', async () => {
      await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      const response = await requestTestAgent
        .get('/auth/me')
        .set('Authorization', token)
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });
  });
});
