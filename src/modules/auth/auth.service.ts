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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async signup(body: SignupDto) {
    const { email, password } = body;
    const existingUser = await this.usersService.findOne(email);

    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const hashedPw = await hash(password, 12);

    const savedUser = await this.usersService.create(body, hashedPw);
    const userId = savedUser._id;

    const token = await this.signUserJwt(savedUser);
    const refreshToken = await this.generateRefreshToken(savedUser);

    return { token, userId, refreshToken };
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

  async refreshJwtToken(body: RefreshTokenDto) {
    const { refreshToken } = body;
    const refreshDoc = await this.refreshTokenModel.findOne({ refreshToken });
    if (!refreshDoc) throw new NotFoundException();

    const id: IdDto = { id: refreshDoc.userId };
    const user = await this.usersService.findOneById(id);

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

  async addCmsUser(body: AddCmsUserDto) {
    const { email, password } = body;
    const existingUser = await this.usersService.findOne(email);

    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const hashedPw = await hash(password, 12);

    const savedUser = await this.usersService.createCms(body, hashedPw);
    const userId = savedUser._id;

    const token = await this.signUserJwt(savedUser);
    const refreshToken = await this.generateRefreshToken(savedUser);

    return { token, userId, refreshToken };
  }
}
