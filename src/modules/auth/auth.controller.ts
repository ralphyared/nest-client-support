import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Roles, Public } from 'src/global/custom-decorators';
import { AddCmsUserDto } from './dto/add-cms-user.dto';
import { AuthorizationGuard } from './authorization.guard';
import { UserRole } from 'src/global/enums';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@UseGuards(AuthorizationGuard)
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Public()
  @Post('/login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Public()
  @Post('/cms-login')
  async cmsLogin(@Body() body: LoginDto) {
    return this.authService.cmsLogin(body);
  }

  @Roles(UserRole.ADMIN)
  @Post('/add-cms-user')
  async addCmsUser(@Body() body: AddCmsUserDto) {
    return this.authService.addCmsUser(body);
  }

  @Public()
  @Post('/refresh-token')
  async refreshJwtToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshJwtToken(body);
  }
}
