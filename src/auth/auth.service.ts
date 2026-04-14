import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    return await this.userService.create(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.issueToken('access', payload),
      refreshToken: this.issueToken('refresh', payload),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      return {
        accessToken: this.issueToken('access', newPayload),
      };
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  private issueToken(
    type: 'access' | 'refresh',
    data: { sub: string; email: string; role: string },
  ) {
    const expiresIn = type === 'access' ? '1h' : '7d';
    return this.jwtService.sign(data, { expiresIn });
  }
}
