import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM tb_user');
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

      expect(response.body.email).toBe(signupDto.email);
      expect(response.body.name).toBe(signupDto.name);
      expect(response.body.password).toBeUndefined();
    });

    it('이메일 중복 시 409', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(409);
    });

    it('이메일 형식이 잘못되면 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...signupDto, email: 'invalid-email' })
        .expect(400);
    });

    it('필수 필드 누락 시 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'test@example.com' })
        .expect(400);
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

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('존재하지 않는 이메일이면 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'none@example.com', password: 'password123' })
        .expect(401);
    });

    it('비밀번호가 틀리면 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: signupDto.email, password: 'wrongpassword' })
        .expect(401);
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

      expect(response.body).toHaveProperty('accessToken');
    });

    it('유효하지 않은 리프레시 토큰이면 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });
});
