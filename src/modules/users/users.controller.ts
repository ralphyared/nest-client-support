import {
  Controller,
  Post,
  Body,
  Patch,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public, Roles } from 'src/global/custom-decorators';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { Types } from 'mongoose';
import { UserRole } from 'src/global/enums';

@UseGuards(AuthorizationGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Patch('/deactivate/:id')
  async deactivateUser(@Param('id') id: Types.ObjectId) {
    return this.usersService.activateDeactivateUser(id, true);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Patch('/activate/:id')
  async activateUser(@Param('id') id: Types.ObjectId) {
    return this.usersService.activateDeactivateUser(id, false);
  }

  @Roles(UserRole.ADMIN)
  @Patch('/admin')
  async switchAdminRights(@Body() body: any) {
    const { role, userId } = body;
    return this.usersService.switchAdminRights(userId, role);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Get('/cms')
  async getCmsUsersPaginated(@Query() query: any) {
    const { limit, page } = query;
    return this.usersService.getCmsUsersPaginated(+limit, +page);
  }

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

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Get('/:id')
  async getUserDetails(@Param('id') id: Types.ObjectId) {
    return this.usersService.findOneById(id);
  }
}
