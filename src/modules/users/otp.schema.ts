import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type OtpDocument = mongoose.HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop()
  otp: number;

  @Prop()
  verifToken: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ verifToken: 1 });
