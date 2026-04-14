import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import request from 'supertest';

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

  beforeEach(async () => {
    await request(app.getHttpServer()).post('/auth/signup').send(signupDto);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: signupDto.email, password: signupDto.password });

    accessToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM tb_plan');
    await dataSource.query('DELETE FROM tb_user');
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

      expect(response.body.title).toBe(createPlanDto.title);
      expect(response.body.description).toBe(createPlanDto.description);
    });

    it('토큰 없으면 401', async () => {
      await request(app.getHttpServer())
        .post('/plan')
        .send(createPlanDto)
        .expect(401);
    });

    it('필수 필드 누락 시 400', async () => {
      await request(app.getHttpServer())
        .post('/plan')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: '설명만' })
        .expect(400);
    });
  });
});
