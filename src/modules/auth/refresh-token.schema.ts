import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop()
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: User;
}

export const TokenSchema = SchemaFactory.createForClass(RefreshToken);
