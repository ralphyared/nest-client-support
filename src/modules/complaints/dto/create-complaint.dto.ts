import { IsMongoId, IsString } from 'class-validator';
export class CreateComplaintDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsMongoId()
  categoryId: string;
}
