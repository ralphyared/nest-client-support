import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Permissions, Public } from 'src/global/custom-decorators';
import { AddCmsUserDto } from './dto/add-cms-user.dto';
import { AuthorizationGuard } from './authorization.guard';

@UseGuards(AuthorizationGuard)
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  async signup(@Body() SignupDto: SignupDto) {
    return this.authService.signup(SignupDto);
  }

  @Public()
  @Post('/login')
  async login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }

  @Public()
  @Post('/cms-login')
  async cmsLogin(@Body() LoginDto: LoginDto) {
    return this.authService.cmsLogin(LoginDto);
  }

  @Permissions({ isAdmin: true, isEmployee: false })
  @Post('/add-cms-user')
  async addCmsUser(@Body() AddCmsUserDto: AddCmsUserDto) {
    return this.authService.addCmsUser(AddCmsUserDto);
  }
}
