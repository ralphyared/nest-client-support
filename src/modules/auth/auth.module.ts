import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthenticationGuard } from './authentication.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthorizationGuard } from './authorization.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: 900 },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthorizationGuard,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [AuthService, AuthorizationGuard, UsersModule],
})
export class AuthModule {}
