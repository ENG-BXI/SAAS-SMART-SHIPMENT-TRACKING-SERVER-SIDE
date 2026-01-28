import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'The name of the company',
    example: 'Tech Solutions Ltd.',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @ApiProperty({
    description: 'The physical location or address of the company',
    example: '123 Innovation Drive, Silicon Valley',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Location must be a string' })
  @MinLength(3, { message: 'Location must be at least 3 characters long' })
  @MaxLength(50, { message: 'Location must be at most 50 characters long' })
  location: string;

  @ApiProperty({
    description: 'The official email address of the company',
    example: 'contact@techsolutions.com',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Company Email must be a string' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MinLength(3, { message: 'Company Email must be at least 3 characters long' })
  @MaxLength(50, {
    message: 'Company Email must be at most 50 characters long',
  })
  companyEmail: string;

  @ApiProperty({
    description: 'Password for the company account',
    example: 'StrongP@ssw0rd!',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'Company Password must be a string' })
  @MinLength(8, {
    message: 'Company Password must be at least 8 characters long',
  })
  @MaxLength(50, {
    message: 'Company Password must be at most 50 characters long',
  })
  companyPassword: string;

  @ApiProperty({
    description: 'Confirmation of the password',
    example: 'StrongP@ssw0rd!',
    minLength: 8,
    maxLength: 50,
  })
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
