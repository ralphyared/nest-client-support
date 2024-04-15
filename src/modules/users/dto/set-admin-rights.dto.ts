import { IsEnum, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { UserRole } from 'src/global/enums';

export class SetAdminRightsDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsEnum(UserRole)
  role: UserRole;
}
