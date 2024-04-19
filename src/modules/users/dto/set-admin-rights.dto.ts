import { IsEnum, IsMongoId } from 'class-validator';
import { Schema, Types } from 'mongoose';
import { UserRole } from 'src/global/enums';

export class SetAdminRightsDto {
  @IsMongoId()
  userId: Schema.Types.ObjectId;

  @IsEnum(UserRole)
  role: UserRole;
}
