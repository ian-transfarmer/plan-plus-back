import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { signupAndLogin } from './utils/auth';
import { cleanupDatabase, createTestApp } from './utils/setup';

describe('Plan (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  const signupDto = {
    name: '홍길동',
    email: 'plan@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    accessToken = await signupAndLogin(app, signupDto);
  });

  afterEach(async () => {
    await cleanupDatabase(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /plan', () => {
    const createPlanDto = {
      title: '테스트 플랜',
      description: '테스트 플랜 설명',
      startTime: '2024-07-01T10:00:00.000Z',
      endTime: '2024-07-01T11:00:00.000Z',
    };

    it('플랜 생성 성공 (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/plan')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPlanDto)
        .expect(201);

      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.title).toBe(createPlanDto.title);
      expect(response.body.description).toBe(createPlanDto.description);
      expect(response.body.startTime).toBeDefined();
      expect(response.body.endTime).toBeDefined();
    });

    it('토큰 없으면 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/plan')
        .send(createPlanDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('필수 필드 누락 시 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/plan')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: '설명만' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toEqual(expect.any(Array));
    });
  });

  describe('GET /plan', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/plan')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '7월 플랜',
          startTime: '2024-07-15T10:00:00.000Z',
          endTime: '2024-07-15T11:00:00.000Z',
        });

      await request(app.getHttpServer())
        .post('/plan')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '8월 플랜',
          startTime: '2024-08-10T10:00:00.000Z',
          endTime: '2024-08-10T11:00:00.000Z',
        });
    });

    it('기간으로 플랜 목록 조회 (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan')
        .query({ startDate: '2024-07-01', endDate: '2024-07-31' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('7월 플랜');
    });

    it('기간 당일에도 포함되는지 확인', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan')
        .query({ startDate: '2024-08-10', endDate: '2024-08-10' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('8월 플랜');
    });

    it('기간에 해당하는 플랜 없으면 빈 배열', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan')
        .query({ startDate: '2024-09-01', endDate: '2024-09-30' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('기간 없이 조회하면 400', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toEqual(expect.any(Array));
    });

    it('토큰 없으면 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });
});
