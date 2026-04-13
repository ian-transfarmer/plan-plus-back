import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signup(dto: SignupDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    return await this.userService.create(dto);
  }
}
