import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Public } from 'src/global/custom-decorators';

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
}
