import { UserRole } from 'src/global/enums';

export class AddCmsUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isVip: boolean;
}
