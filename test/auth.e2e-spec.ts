import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { cleanupDatabase, createTestApp } from './utils/setup';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await cleanupDatabase(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /auth/signup', () => {
    const signupDto = {
      name: '홍길동',
      email: 'test@example.com',
      password: 'password123',
    };

    it('회원가입 성공 (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.email).toBe(signupDto.email);
      expect(response.body.name).toBe(signupDto.name);
      expect(response.body.password).toBeUndefined();
    });

    it('이메일 중복 시 409', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toBeDefined();
    });

    it('이메일 형식이 잘못되면 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...signupDto, email: 'invalid-email' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toEqual(expect.any(Array));
    });

    it('필수 필드 누락 시 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toEqual(expect.any(Array));
    });
  });

  describe('POST /auth/login', () => {
    const signupDto = {
      name: '홍길동',
      email: 'login@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/signup').send(signupDto);
    });

    it('로그인 성공 시 accessToken 반환 (200)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: signupDto.email, password: signupDto.password })
        .expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.refreshToken).toEqual(expect.any(String));
    });

    it('존재하지 않는 이메일이면 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'none@example.com', password: 'password123' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('비밀번호가 틀리면 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: signupDto.email, password: 'wrongpassword' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    const signupDto = {
      name: '홍길동',
      email: 'refresh@example.com',
      password: 'password123',
    };

    let refreshToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/signup').send(signupDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: signupDto.email, password: signupDto.password });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('리프레시 토큰으로 새 토큰 발급 (200)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
    });

    it('유효하지 않은 리프레시 토큰이면 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });
});
