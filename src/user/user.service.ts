import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, USER_STATUS } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email, status: USER_STATUS.ACTIVE },
    });
  }

  async create(dto: Partial<User>) {
    if (dto.password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(dto.password, salt);
      dto.password = hashedPassword;
    }
    const user = this.userRepository.create(dto);
    return await this.userRepository.save(user);
  }
}
