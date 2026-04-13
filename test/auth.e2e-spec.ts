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
});
