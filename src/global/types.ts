import { Types } from 'mongoose';

class User {
  _id: Types.ObjectId;
}

export class UserRequest extends Request {
  user: User;
}
