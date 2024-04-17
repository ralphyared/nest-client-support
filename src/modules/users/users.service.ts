import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from '../auth/dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { ChangePasswordDto } from './dto/change-password.dto';
import { compareSync, hash } from 'bcrypt';
import { OtpService } from './otp.service';
import * as nodemailer from 'nodemailer';
import { AddCmsUserDto } from '../auth/dto/add-cms-user.dto';
import { UserRole } from 'src/global/enums';
import { IdDto, PaginationDto } from 'src/global/commons.dto';
import { SetAdminRightsDto } from './dto/set-admin-rights.dto';
import {
  ForgotPasswordDto,
  ForgotPasswordResendDto,
  ResetPasswordDto,
} from './dto/forgot-password-process.dto';
import { incorrectPasswordError } from 'src/global/errors/auth.errors';
import { userNotFoundError } from 'src/global/errors/users.errors';
import { UserRequest } from 'src/global/types';

@Injectable()
export class UsersService {
  private transporter: any;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private otpService: OtpService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: process.env.MAILER_SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
      },
    });
  }

  async activateDeactivateUser(param: IdDto, deactivationStatus: boolean) {
    const { id } = param;
    const user = await this.userModel.findById(id);
    user.isDeactivated = deactivationStatus;
    user.save();
    return {
      message: `User deactivation status set to: ${deactivationStatus}`,
    };
  }

  async switchAdminRights(body: SetAdminRightsDto) {
    const { role, userId } = body;
    const user = await this.userModel.findById(userId);
    user.role = role;
    user.save();
    return {
      message: `User role set to: ${role}`,
    };
  }

  async getCmsUsersPaginated(query: PaginationDto) {
    const { limit, page } = query;
    const aggregation = [
      {
        $match: {
          role: { $ne: UserRole.USER },
        },
      },
      { $skip: (+page - 1) * +limit },
      { $limit: +limit },
    ];
    const usersList = await this.userModel.aggregate(aggregation);
    const count = await this.userModel.countDocuments({
      role: { $ne: UserRole.USER },
    });
    const totalPages = Math.ceil(+count / +limit);
    return {
      usersList,
      totalPages,
    };
  }

  async create(body: SignupDto, hashedPw: string) {
    const { email, firstName, lastName } = body;

    const user = new this.userModel({
      email,
      password: hashedPw,
      firstName,
      lastName,
    });
    const savedUser = await user.save();

    return savedUser;
  }

  async createCms(body: AddCmsUserDto, hashedPw: string) {
    const { email, role, firstName, lastName } = body;

    const user = new this.userModel({
      email,
      password: hashedPw,
      firstName,
      lastName,
      role,
    });
    const savedUser = await user.save();

    return savedUser;
  }

  async findOne(email: string) {
    return this.userModel.findOne({ email });
  }

  async findOneById(param: IdDto) {
    const { id } = param;
    return this.userModel.findById(id);
  }

  async changePassword(body: ChangePasswordDto, req: UserRequest) {
    const { newPassword, password } = body;
    const userId = req.user._id;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(userNotFoundError);
    }

    const isEqual = compareSync(password, user.password!);
    if (!isEqual) {
      throw new UnauthorizedException(incorrectPasswordError);
    }
    const newhashedPw = await hash(newPassword, 12);
    user.password = newhashedPw;
    await user.save();
  }

  async forgotPassword(body: ForgotPasswordDto) {
    const { email } = body;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return;
    }
    const otp = await this.otpService.createOtp(user._id);
    this.sendOtpByEmail(email, otp.otp);
    return otp.verifToken;
  }

  async forgotPasswordResend(body: ForgotPasswordResendDto) {
    const { verifToken } = body;
    const otp = await this.otpService.incrementOtp(verifToken);
    const user = await this.userModel.findById(otp.userId);
    this.sendOtpByEmail(user.email, otp.otp);
  }

  async forgotPasswordVerifyOtp(body: ResetPasswordDto) {
    const { verifToken, enteredOtp } = body;
    return this.otpService.verifyOtp(verifToken, +enteredOtp);
  }

  async resetPassword(body: ResetPasswordDto) {
    const { verifToken, newPassword } = body;
    const userId = await this.otpService.getUserIdFromOtp(verifToken);
    const user = await this.userModel.findById(userId);
    const newhashedPw = await hash(newPassword, 12);
    user.password = newhashedPw;
    return user.save();
  }

  async sendOtpByEmail(email: string, otp: number) {
    await this.transporter.sendMail({
      from: process.env.MAILER_USER,
      to: email,
      subject: 'Password Reset',
      text: `Your OTP for password reset is: ${otp}`,
    });
  }
}
