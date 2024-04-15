import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { compareSync, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { AddCmsUserDto } from './dto/add-cms-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from './refresh-token.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async signup(SignupDto: SignupDto) {
    const { email, password } = SignupDto;
    const existingUser = await this.usersService.findOne(email);

    if (existingUser) {
      const err = new Error('User already exists.');
      throw err;
    }

    const hashedPw = await hash(password, 12);

    const savedUser = await this.usersService.create(SignupDto, hashedPw);
    const userId = savedUser._id;

    const token = await this.signUserJwt(savedUser);
    const refreshToken = await this.generateRefreshToken(savedUser);

    return { token, userId, refreshToken };
  }

  async cmsLogin(LoginDto: LoginDto) {
    const { email, password } = LoginDto;

    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new Error('User does not exist.');
    }

    if (!(user.role === 'ADMIN' || user.role === 'EMPLOYEE')) {
      throw new ForbiddenException('User is not a CMS user.');
    }

    const isEqual = compareSync(password, user.password);
    if (!isEqual) {
      const err = new Error('Wrong password.');
      throw err;
    }

    const userId = user._id;
    const token = await this.signUserJwt(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { token, userId, refreshToken };
  }

  async login(LoginDto: LoginDto) {
    const { email, password } = LoginDto;

    const user = await this.usersService.findOne(email);
    if (!user) {
      const err = new Error('User does not exist.');
      throw err;
    }

    const isEqual = compareSync(password, user.password);
    if (!isEqual) {
      const err = new Error('Wrong password.');
      throw err;
    }

    const userId = user._id;
    const token = await this.signUserJwt(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { token, userId, refreshToken };
  }

  async generateRefreshToken(user: any) {
    const userObj = { ...user }._doc;
    delete userObj.password;

    const refreshToken = await this.jwtService.signAsync(userObj, {
      secret: `${process.env.JWT_REFRESH_SECRET}`,
      expiresIn: 86400,
    });
    refreshToken.replace(/\r?\n|\r/g, '');

    const newToken = new this.refreshTokenModel({
      refreshToken,
      userId: user._id,
    });
    newToken.save();

    return refreshToken;
  }

  async refreshJwtToken(refreshToken: string) {
    const refreshDoc = await this.refreshTokenModel.findOne({ refreshToken });
    if (!refreshDoc) throw new NotFoundException();

    const user = await this.usersService.findOneById(refreshDoc.userId);

    const userId = user._id;
    const token = await this.signUserJwt(user);
    return { token, userId, refreshToken };
  }

  async signUserJwt(user: any) {
    const userObj = { ...user }._doc;
    delete userObj.password;

    const token = await this.jwtService.signAsync(userObj, {
      secret: `${process.env.JWT_SECRET}`,
      expiresIn: 900,
    });
    token.replace(/\r?\n|\r/g, '');

    return token;
  }

  async addCmsUser(AddCmsUserDto: AddCmsUserDto) {
    const { email, password } = AddCmsUserDto;
    const existingUser = await this.usersService.findOne(email);

    if (existingUser) {
      const err = new Error('User already exists.');
      throw err;
    }

    const hashedPw = await hash(password, 12);

    const savedUser = await this.usersService.createCms(
      AddCmsUserDto,
      hashedPw,
    );
    const userId = savedUser._id;

    const token = await this.signUserJwt(savedUser);
    const refreshToken = await this.generateRefreshToken(savedUser);

    return { token, userId, refreshToken };
  }
}
