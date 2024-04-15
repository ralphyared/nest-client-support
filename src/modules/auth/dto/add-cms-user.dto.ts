import { UserRole } from 'src/global/enums';
import { SignupDto } from './signup.dto';
import { IsEnum } from 'class-validator';

export class AddCmsUserDto extends SignupDto {
  @IsEnum(UserRole)
  role: UserRole;
}
