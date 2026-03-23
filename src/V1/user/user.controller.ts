import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/V1/auth/guards/auth.guard';

@Controller({ path: 'user', version: '1' })
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createNewUser(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const user = await this.userService.createNewUser(
      createUserDto,
      req.user.companyId,
    );
    return {
      data: user,
      message: 'Create User successfully',
      status: HttpStatus.OK,
    };
  }
}
