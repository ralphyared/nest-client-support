import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { IdDto } from 'src/global/common.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from 'src/global/enums';
import * as randomstring from 'randomstring';
import { UserDocument } from '../users/user.schema';
import config from '../../global/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  private async generateLoginResponse(user: UserDocument) {
    const token = await this.signUserJwt(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { token, userId: user._id, refreshToken };
  }

  private async hashPassword(password: string) {
    return hash(password, config().authConfig.saltRounds);
  }

  async signup(body: SignupDto) {
    const { email, password } = body;
    const existingUser = await this.usersService.findOne(email);

    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const hashedPw = await this.hashPassword(password);

    const savedUser = await this.usersService.create(body, hashedPw);

    return this.generateLoginResponse(savedUser);
  }

  async cmsLogin(body: LoginDto) {
    const { email, password } = body;

    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    if (user.role === UserRole.USER) {
      throw new ForbiddenException('User is not a CMS user.');
    }

    const isEqual = compareSync(password, user.password);
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect password.');
    }

    const userId = user._id;
    const token = await this.signUserJwt(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { token, userId, refreshToken };
  }

  async login(body: LoginDto) {
    const { email, password } = body;

    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    const isEqual = compareSync(password, user.password);
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect password.');
    }

    return this.generateLoginResponse(user);
  }

  async generateRefreshToken(user: any) {
    const refreshToken = randomstring.generate({
      length: 20,
      charset: 'alphanumeric',
    });

    const newToken = new this.refreshTokenModel({
      refreshToken,
      userId: user._id,
    });
    newToken.save();

    return refreshToken;
  }

  async refreshJwtToken(body: RefreshTokenDto) {
    const { refreshToken } = body;
    const refreshDoc = await this.refreshTokenModel.findOneAndDelete({
      refreshToken,
    });
    if (!refreshDoc) throw new NotFoundException();

    const id: IdDto = { id: refreshDoc.userId };
    const user = await this.usersService.findOneById(id);

    return this.generateLoginResponse(user);
  }

  async signUserJwt(user: UserDocument) {
    const token = await this.jwtService.signAsync(
      {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      {
        secret: config().authConfig.jwtSecret,
        expiresIn: 900,
      },
    );
    token.replace(/\r?\n|\r/g, '');

    return token;
  }

  async addCmsUser(body: AddCmsUserDto) {
    const { email, password } = body;
    const existingUser = await this.usersService.findOne(email);

    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const hashedPw = await this.hashPassword(password);

    const savedUser = await this.usersService.createCms(body, hashedPw);

    return { userId: savedUser._id };
  }
}
