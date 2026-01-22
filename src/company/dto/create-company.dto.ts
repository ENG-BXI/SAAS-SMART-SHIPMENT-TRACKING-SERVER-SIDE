import {
  IsString,
  MinLength,
  MaxLength,
  Equals,
  IsEmail,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;
  @IsString({ message: 'Location must be a string' })
  @MinLength(3, { message: 'Location must be at least 3 characters long' })
  @MaxLength(50, { message: 'Location must be at most 50 characters long' })
  location: string;
  @IsString({ message: 'Company Email must be a string' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MinLength(3, { message: 'Company Email must be at least 3 characters long' })
  @MaxLength(50, {
    message: 'Company Email must be at most 50 characters long',
  })
  companyEmail: string;
  @IsString({ message: 'Company Password must be a string' })
  @MinLength(8, {
    message: 'Company Password must be at least 8 characters long',
  })
  @MaxLength(50, {
    message: 'Company Password must be at most 50 characters long',
  })
  companyPassword: string;
  @IsString({ message: 'Confirm Password must be a string' })
  @MinLength(8, {
    message: 'Confirm Password must be at least 8 characters long',
  })
  @MaxLength(50, {
    message: 'Confirm Password must be at most 50 characters long',
  })
  //   compare companyPassword with confirmPassword
  confirmPassword: string;
}
