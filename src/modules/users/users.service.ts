import { Injectable } from '@nestjs/common';
import { SignupDto } from '../auth/dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { ChangePasswordDto } from './dto/change-password.dto';
import { compareSync, hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
    await user.save();
    return;
  }
}
