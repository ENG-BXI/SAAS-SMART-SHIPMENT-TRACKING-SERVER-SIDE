import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
    @IsNotEmpty({message:'email is required'})
    @IsEmail({},{message:'email is invalid'})
    email: string;
    @IsNotEmpty({message:'password is required'})
    @IsString({message:'password must be a string'})
    @MinLength(8,{message:'password must be at least 8 characters long'})
    password: string;
}