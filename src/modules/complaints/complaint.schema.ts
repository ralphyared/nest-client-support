import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ComplaintStatus } from 'src/global/enums';
import { Category } from 'src/modules/categories/category.schema';
import { User } from '../users/user.schema';

export type ComplaintDocument = HydratedDocument<Complaint>;

@Schema({ timestamps: true })
export class Complaint {
  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({ enum: ComplaintStatus, default: ComplaintStatus.PENDING })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categoryId: Category[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: User;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
