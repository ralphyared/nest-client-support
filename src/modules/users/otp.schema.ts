import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop()
  otp: number;

  @Prop()
  verifToken: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ verifToken: 1 });
