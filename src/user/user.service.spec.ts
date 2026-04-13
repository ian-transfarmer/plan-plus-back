import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entity/user.entity';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findByEmail', () => {
    it('이메일로 유저 조회 성공', async () => {
      const mockUser = { id: 'uuid-1234', email: 'test@example.com' };
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 이메일이면 null 반환', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.findByEmail('none@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('유저 생성 성공', async () => {
      const dto = { name: '홍길동', email: 'test@example.com' };
      const mockUser = { id: 'uuid-1234', ...dto };
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await userService.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('비밀번호가 있으면 해싱되어 저장', async () => {
      const dto = {
        name: '홍길동',
        email: 'test@example.com',
        password: 'password123',
      };
      userRepository.create.mockImplementation((d) => d);
      userRepository.save.mockImplementation((d) => Promise.resolve(d));

      await userService.create(dto);

      const createArg = userRepository.create.mock.calls[0][0];
      expect(createArg.password).not.toBe('password123');
    });

    it('비밀번호가 없으면 해싱하지 않음', async () => {
      const dto = { name: '홍길동', email: 'test@example.com' };
      userRepository.create.mockReturnValue(dto);
      userRepository.save.mockResolvedValue(dto);

      await userService.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
    });
  });
});
