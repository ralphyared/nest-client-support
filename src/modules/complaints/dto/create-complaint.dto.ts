import { Types } from 'mongoose';

export class CreateComplaintDto {
  title: string;
  body: string;
  status: string;
  categoryId: Types.ObjectId;
}
