import { createParamDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { UserRole } from './enums';

export const User = createParamDecorator((data, req) => {
  return req.user;
});

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
