import { Schema, Types } from 'mongoose';

interface User {
  _id: Schema.Types.ObjectId;
}

export class UserRequest extends Request {
  user: User;
}

export interface ComplaintFilter {
  createdBy?: Schema.Types.ObjectId;
  status?: string;
}
