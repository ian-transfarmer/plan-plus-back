import { INestApplication } from '@nestjs/common';
import request from 'supertest';

interface SignupDto {
  name: string;
  email: string;
  password: string;
}

export async function signupAndLogin(
  app: INestApplication,
  dto: SignupDto,
): Promise<string> {
  await request(app.getHttpServer()).post('/auth/signup').send(dto);

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: dto.email, password: dto.password });

  return loginResponse.body.accessToken;
}
