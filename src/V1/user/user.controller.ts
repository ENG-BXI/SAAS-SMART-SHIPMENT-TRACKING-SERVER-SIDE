import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  ValidationPipe,
  HttpStatus,
  Put,
  Param,
  Delete,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/V1/auth/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller({ path: 'user', version: '1' })
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async getAllUsers(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const users = await this.userService.getAllUsers(
      req.user.companyId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(users.userCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page !== 1;
    return {
      data: {
        data: users.users,
        totalCount: users.userCount,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Users fetched successfully',
      status: HttpStatus.OK,
    };
  }
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
  @Put(':id')
  async editUser(
    @Body(new ValidationPipe()) userDto: UpdateUserDto,
    @Param('id') userId: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const user = await this.userService.editUser(
      userId,
      userDto,
      req.user.companyId,
    );
    return {
      data: user,
      message: 'Edit User successfully',
      status: HttpStatus.OK,
    };
  }
  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const user = await this.userService.deleteUser(userId, req.user.companyId);
    return {
      data: user,
      message: 'Delete User successfully',
      status: HttpStatus.OK,
    };
  }
}
