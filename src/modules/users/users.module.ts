import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './user.schema';
import { OtpService } from './otp.service';
import { Otp, OtpSchema } from './otp.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, OtpService],
  exports: [UsersService, OtpService],
})
export class UsersModule {}
