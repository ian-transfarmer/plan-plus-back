import { Reflector } from '@nestjs/core';
import { ROLE } from '../../user/entity/user.entity';

export const Role = Reflector.createDecorator<ROLE>();
