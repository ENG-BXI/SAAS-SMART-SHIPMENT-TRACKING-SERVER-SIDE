import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { USER_ROLE } from 'src/Common/constant/user-role';

export class CreateUserDto {
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  name: string;
  @IsNotEmpty({ message: 'email is required' })
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email is invalid' })
  email: string;
  @IsNotEmpty({ message: 'password is required' })
  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  password: string;
  @IsNotEmpty({ message: 'role is required' })
  @IsString({ message: 'role must be a string' })
  @IsIn([USER_ROLE.MANAGER, USER_ROLE.EMPLOYEE, USER_ROLE.DRIVER], {
    message: 'role is invalid',
  })
  role: string;
}
