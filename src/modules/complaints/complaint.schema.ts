import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ComplaintStatus } from 'src/global/enums';

export type ComplaintDocument = mongoose.HydratedDocument<Complaint>;

@Schema({ timestamps: true })
export class Complaint {
  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({ enum: ComplaintStatus, default: ComplaintStatus.PENDING })
  status: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categoryId: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
ComplaintSchema.index({ createdBy: 1 });
