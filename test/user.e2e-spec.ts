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

describe('User (e2e)', () => {
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

  describe('GET /user/me', () => {
    const signupDto = {
      name: '홍길동',
      email: 'me@example.com',
      password: 'password123',
    };

    let accessToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/signup').send(signupDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: signupDto.email, password: signupDto.password });

      accessToken = loginResponse.body.accessToken;
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
