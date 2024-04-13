import { Injectable } from '@nestjs/common';
import { SignupDto } from '../auth/dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { ChangePasswordDto } from './dto/change-password.dto';
import { compareSync, hash } from 'bcrypt';
import { OtpService } from './otp.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  private transporter;

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

  async create(SignupDto: SignupDto, hashedPw: string) {
    const {
      email,
      firstName,
      isAdmin,
      isDeactivated,
      isEmployee,
      isVip,
      lastName,
    } = SignupDto;

    const user = new this.userModel({
      email,
      password: hashedPw,
      firstName,
      lastName,
      isAdmin,
      isDeactivated,
      isEmployee,
      isVip,
    });
    const savedUser = await user.save();

    return savedUser;
  }

  async findOne(email: string) {
    return this.userModel.findOne({ email });
  }

  async findOneById(id: Types.ObjectId) {
    return this.userModel.findById(id);
  }

  async changePassword(
    ChangePasswordDto: ChangePasswordDto,
    userId: Types.ObjectId,
  ) {
    const { newPassword, password } = ChangePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      throw err;
    }

    const isEqual = compareSync(password, user.password!);
    if (!isEqual) {
      const err = new Error('Wrong password.');
      throw err;
    }
    const newhashedPw = await hash(newPassword, 12);
    user.password = newhashedPw;
    return user.save();
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      const err = new Error();
      throw err;
    }
    const otp = await this.otpService.createOtp(user._id);
    this.sendOtpByEmail(email, otp.otp);
  }

  async forgotPasswordResend(verifToken: string) {
    const otp = await this.otpService.incrementOtp(verifToken);
    const user = await this.userModel.findById(otp.userId);
    this.sendOtpByEmail(user.email, otp.otp);
  }

  async forgotPasswordVerifyOtp(verifToken: string, enteredOtp: number) {
    return this.otpService.verifyOtp(verifToken, +enteredOtp);
  }

  async resetPassword(verifToken: string, newPassword: string) {
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
