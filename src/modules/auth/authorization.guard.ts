import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { REQUEST, Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { UserRequest } from 'src/global/types';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    @Inject(REQUEST) private readonly request: UserRequest,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const userId = { id: this.request.user._id };
    const user = await this.usersService.findOneById(userId);

    const isAuthorized = requiredRoles.includes(user.role);

    return !!isAuthorized;
  }
}
