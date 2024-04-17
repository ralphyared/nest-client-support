import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop()
  otp: number;

  @Prop()
  verifToken: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: User;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ verifToken: 1 });
