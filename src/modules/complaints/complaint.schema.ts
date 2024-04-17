import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ComplaintStatus } from 'src/global/enums';

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
  categoryId: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
