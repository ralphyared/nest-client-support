import { Controller, Post, Body, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from 'src/global/custom-decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/password')
  async changePassword(
    @Body() ChangePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    const userId = req.user._id;
    return this.usersService.changePassword(ChangePasswordDto, userId);
  }

  @Public()
  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const verifToken = await this.usersService.forgotPassword(email);
    return verifToken;
  }

  @Public()
  @Post('/forgot-password-resend')
  async forgotPasswordResend(@Body('verifToken') verifToken: string) {
    return this.usersService.forgotPasswordResend(verifToken);
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() body: any) {
    const { verifToken, enteredOtp, newPassword } = body;
    await this.usersService.forgotPasswordVerifyOtp(verifToken, enteredOtp);
    await this.usersService.resetPassword(verifToken, newPassword);
  }
}
