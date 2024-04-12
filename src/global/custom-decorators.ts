import { createParamDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  return req.user;
});

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
