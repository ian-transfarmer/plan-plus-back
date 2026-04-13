import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { ConflictException } from '@nestjs/common';
import { PROVIDER, ROLE, USER_STATUS } from '../user/entity/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: { findByEmail: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    userService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: UserService, useValue: userService }],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      name: '홍길동',
      email: 'test@example.com',
      password: 'password123',
    };

    it('회원가입 성공', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue({
        id: 'uuid-1234',
        name: signupDto.name,
        email: signupDto.email,
        role: ROLE.USER,
        provider: PROVIDER.LOCAL,
        status: USER_STATUS.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.signup(signupDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(signupDto.email);
      expect(userService.create).toHaveBeenCalled();
      expect(result.email).toBe(signupDto.email);
      expect(result.name).toBe(signupDto.name);
    });

    it('이미 가입된 이메일이면 ConflictException', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 'uuid-existing',
        email: signupDto.email,
        status: USER_STATUS.ACTIVE,
      });

      await expect(authService.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
