import { IsEnum } from 'class-validator';
import { ComplaintStatus } from 'src/global/enums';

export class UpdateComplaintStatusDto {
  @IsEnum(ComplaintStatus)
  status: string;
}
