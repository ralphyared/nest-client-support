import { generate } from 'otp-generator';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './otp.schema';
import { Model, Schema, Types } from 'mongoose';
import { incorrectOtpError } from 'src/global/errors/users.errors';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<Otp>) {}

  async createOtp(userId: Types.ObjectId) {
    const otp = generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });

    const verifToken = generate();
    const newOtp = new this.otpModel({
      otp: otp,
      userId: userId,
      verifToken: verifToken,
    });
    return newOtp.save();
  }

  async incrementOtp(verifToken: string) {
    await this.otpModel.findOne({ verifToken });
    const newOtp = generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
    await this.otpModel.updateOne(
      { verifToken: verifToken },
      { $set: { otp: newOtp } },
    );
    const otp = await this.otpModel.findOne({ verifToken });
    return otp;
  }

  async verifyOtp(verifToken: string, enteredOtp: number) {
    const otp = await this.otpModel.findOne({ verifToken });
    if (enteredOtp !== otp.otp) {
      throw new UnauthorizedException(incorrectOtpError);
    }
  }

  async getUserIdFromOtp(verifToken: string) {
    const otp = await this.otpModel.findOne({ verifToken });
    return otp.userId;
  }
}
