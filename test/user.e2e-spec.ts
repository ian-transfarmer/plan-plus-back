import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { signupAndLogin } from './utils/auth';
import { createTestApp } from './utils/setup';

describe('User (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM tb_user');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('GET /user/me', () => {
    const signupDto = {
      name: '홍길동',
      email: 'me@example.com',
      password: 'password123',
    };

    let accessToken: string;

    beforeEach(async () => {
      accessToken = await signupAndLogin(app, signupDto);
    });

    it('자기 정보 조회 성공 (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(signupDto.email);
      expect(response.body.name).toBe(signupDto.name);
      expect(response.body.password).toBeUndefined();
    });

    it('토큰 없으면 401', async () => {
      await request(app.getHttpServer()).get('/user/me').expect(401);
    });

    it('잘못된 토큰이면 401', async () => {
      await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
