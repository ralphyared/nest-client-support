import { PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNumber, IsString } from 'class-validator';

class ForgotPasswordProcessDto {
  @IsEmail()
  email: string;

  @IsString()
  verifToken: string;

  @IsNumber()
  enteredOtp: number;

  @IsString()
  newPassword: string;
}

export class ForgotPasswordDto extends PickType(ForgotPasswordProcessDto, [
  'email',
] as const) {}

export class ForgotPasswordResendDto extends PickType(
  ForgotPasswordProcessDto,
  ['verifToken'] as const,
) {}

export class ResetPasswordDto extends PickType(ForgotPasswordProcessDto, [
  'verifToken',
  'enteredOtp',
  'newPassword',
] as const) {}
