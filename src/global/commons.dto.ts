import { IsEnum, IsMongoId, IsNumberString, IsOptional } from 'class-validator';
import { Schema, Types } from 'mongoose';
import { ComplaintStatus } from './enums';

export class PaginationDto {
  @IsNumberString()
  limit: number;

  @IsNumberString()
  page: number;
}

export class FilteredPaginationDto extends PaginationDto {
  @IsOptional()
  @IsMongoId()
  userId: Schema.Types.ObjectId;

  @IsOptional()
  @IsEnum(ComplaintStatus)
  status: string;
}

export class IdDto {
  @IsMongoId()
  id: Schema.Types.ObjectId;
}
