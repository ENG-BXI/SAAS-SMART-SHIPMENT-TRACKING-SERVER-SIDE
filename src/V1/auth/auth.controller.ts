import {
  Controller,
  Post,
  Body,
  HttpStatus,
  ValidationPipe,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller({path:'auth',version:'1'})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    try {
      const token = await this.authService.login(loginDto);
      return {
        data: token,
        message: 'Login successfully',
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
