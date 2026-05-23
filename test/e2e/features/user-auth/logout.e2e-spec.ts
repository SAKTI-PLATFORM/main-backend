/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { User } from 'src/domain/entity/user.entity';
import { MessageResponse } from 'src/infrastructure/core/http/http-response';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from '../../../utils/create-testing-app.utils';
import {
  createJobSeekerUser,
  loginAsJobSeeker,
} from '../../../utils/test-helpers.utils';
import {
  clearDatabase,
  createTestDatabase,
  dropTestDatabase,
  generateTestDatabaseName,
} from '../../../utils/testing-database.utils';

describe('Logout (e2e)', () => {
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

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      const response = await requestTestAgent
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as MessageResponse;
      expect(body).toHaveProperty('statusCode', 200);
      expect(body).toHaveProperty('message', 'Logout berhasil');
    });

    it('should clear activeToken after successful logout', async () => {
      const user = await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      const userBeforeLogout = await dataSource.manager.findOne(User, {
        where: { id: user.id },
      });
      expect(userBeforeLogout?.activeToken).toBe(token);

      await requestTestAgent
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const userAfterLogout = await dataSource.manager.findOne(User, {
        where: { id: user.id },
      });
      expect(userAfterLogout?.activeToken).toBeNull();
    });

    it('should return 401 when no token is provided', async () => {
      const response = await requestTestAgent.post('/auth/logout').expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await requestTestAgent
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 when token is used after logout', async () => {
      await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      await requestTestAgent
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const response = await requestTestAgent
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 when Authorization header format is incorrect', async () => {
      await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      const response = await requestTestAgent
        .post('/auth/logout')
        .set('Authorization', token)
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });

    it('should not allow access to protected routes after logout', async () => {
      await createJobSeekerUser(dataSource);
      const token = await loginAsJobSeeker(requestTestAgent);

      await requestTestAgent
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await requestTestAgent
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const response = await requestTestAgent
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      const body = response.body;
      expect(body).toHaveProperty('statusCode', 401);
    });
  });
});
