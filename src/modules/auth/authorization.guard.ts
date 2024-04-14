import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get('permissions', context.getHandler());

    if (!permissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = await this.usersService.findOneById(request.user._id);

    const { isEmployee } = permissions;

    if ((isEmployee && user.isEmployee) || user.isAdmin) {
      return true;
    }
    return false;
  }
}
