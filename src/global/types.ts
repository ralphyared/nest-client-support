import { Types } from 'mongoose';

interface User {
  _id: Types.ObjectId;
}

export class UserRequest extends Request {
  user: User;
}

export interface ComplaintFilter {
  createdBy?: Types.ObjectId;
  status?: string;
}
