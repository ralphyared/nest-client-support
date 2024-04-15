import { IsEnum, IsMongoId, IsString } from 'class-validator';
import { ComplaintStatus } from 'src/global/enums';

export class CreateComplaintDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @IsMongoId()
  categoryId: string;
}
