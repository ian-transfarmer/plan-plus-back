import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from '../../user/entity/user.entity';
import { Role } from '../decorator/role.decorator';

const ROLE_LEVEL: Record<string, number> = {
  [ROLE.USER]: 1,
  [ROLE.ADMIN]: 2,
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get(Role, context.getHandler());
    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    if (!userRole) {
      return false;
    }

    return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
  }
}
