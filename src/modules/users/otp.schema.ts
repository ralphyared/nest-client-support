import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop()
  otp: number;

  @Prop()
  verifToken: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: User;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
