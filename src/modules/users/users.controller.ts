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
import { UserRole } from 'src/global/enums';
import { IdDto, PaginationDto } from 'src/global/commons.dto';
import { SetAdminRightsDto } from './dto/set-admin-rights.dto';
import {
  ForgotPasswordDto,
  ForgotPasswordResendDto,
  ResetPasswordDto,
} from './dto/forgot-password-process.dto';
import { UserRequest } from 'src/global/types';

@UseGuards(AuthorizationGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Patch('/deactivate/:id')
  async deactivateUser(@Param() param: IdDto) {
    return this.usersService.activateDeactivateUser(param, true);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Patch('/activate/:id')
  async activateUser(@Param() param: IdDto) {
    return this.usersService.activateDeactivateUser(param, false);
  }

  @Roles(UserRole.ADMIN)
  @Patch('/admin')
  async switchAdminRights(@Body() body: SetAdminRightsDto) {
    return this.usersService.switchAdminRights(body);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Get('/cms')
  async getCmsUsersPaginated(@Query() query: PaginationDto) {
    return this.usersService.getCmsUsersPaginated(query);
  }

  // Issue with Dependency on Service with Request Scoped Provider
  @Patch('/password')
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Req() req: UserRequest,
  ) {
    return this.usersService.changePassword(body, req);
  }

  @Public()
  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const verifToken = await this.usersService.forgotPassword(body);
    return verifToken;
  }

  @Public()
  @Post('/forgot-password-resend')
  async forgotPasswordResend(@Body() body: ForgotPasswordResendDto) {
    return this.usersService.forgotPasswordResend(body);
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.usersService.forgotPasswordVerifyOtp(body);
    await this.usersService.resetPassword(body);
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Get('/:id')
  async getUserDetails(@Param() param: IdDto) {
    return this.usersService.findOneById(param);
  }
}
