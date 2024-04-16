import {
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class PaginationDto {
  @IsNumberString()
  limit: number;

  @IsNumberString()
  page: number;
}

export class FilteredPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  status: string;
}

export class IdDto {
  @IsMongoId()
  id: Types.ObjectId;
}
