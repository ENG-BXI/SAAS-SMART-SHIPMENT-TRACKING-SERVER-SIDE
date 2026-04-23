import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_ROLE, USER_ROLE_FIELD } from '../../Common/constant/user-role';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllUsers(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          AND: [
            { companyId: companyId },
            search
              ? {
                  OR: [
                    { userName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {},
          ],
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          userName: true,
          email: true,
          isManager: true,
          isEmployee: true,
          isDriver: true,
        },
      });
      const userCount = await this.prisma.user.count({
        where: {
          AND: [
            { companyId: companyId },
            search
              ? {
                  OR: [
                    { userName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {},
          ],
        },
      });
      const allUsers = users.map((user) => {
        return {
          id: user.id,
          userName: user.userName,
          email: user.email,
          role: user.isManager
            ? USER_ROLE.MANAGER
            : user.isEmployee
              ? USER_ROLE.EMPLOYEE
              : user.isDriver
                ? USER_ROLE.DRIVER
                : null,
        };
      });
      return { users: allUsers, userCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createNewUser(userDto: CreateUserDto, companyId: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userDto.email, companyId: companyId },
      });
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = bcrypt.hashSync(userDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: userDto.email,
          companyId: companyId,
          password: hashedPassword,
          userName: userDto.name,
          isManager: userDto.role === USER_ROLE.MANAGER,
          isEmployee: userDto.role === USER_ROLE.EMPLOYEE,
          isDriver: userDto.role === USER_ROLE.DRIVER,
        },
        select: {
          id: true,
          email: true,
          userName: true,
          isManager: true,
          isEmployee: true,
          isDriver: true,
        },
      });
      const newUser = {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: userDto.role,
      };
      return newUser;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editUser(userId: string, userDto: UpdateUserDto, companyId: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId, companyId: companyId },
      });
      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      let hashedPassword = existingUser.password;
      if (userDto.password) {
        hashedPassword = bcrypt.hashSync(userDto.password, 10);
      }
      const existEmail = await this.prisma.user.findFirst({
        where: {
          email: userDto.email,
          companyId: companyId,
          id: {
            not: userId,
          },
        },
      });
      if (existEmail) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      const user = await this.prisma.user.update({
        where: { id: userId, companyId: companyId },
        data: {
          email: userDto.email,
          companyId: companyId,
          password: hashedPassword,
          userName: userDto.name,
          isManager: userDto.role === USER_ROLE.MANAGER,
          isEmployee: userDto.role === USER_ROLE.EMPLOYEE,
          isDriver: userDto.role === USER_ROLE.DRIVER,
        },
        select: {
          id: true,
          email: true,
          userName: true,
          isManager: true,
          isEmployee: true,
          isDriver: true,
        },
      });
      const updatedUser = {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: userDto.role,
      };
      return updatedUser;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteUser(userId: string, companyId: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId, companyId: companyId },
      });
      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      const user = await this.prisma.user.delete({
        where: { id: userId, companyId: companyId },
        select: {
          email: true,
          userName: true,
        },
      });
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getAllDrivers(companyId: string) {
    try {
      const drivers = await this.prisma.user.findMany({
        where: {
          companyId: companyId,
          isDriver: true,
        },
        select: {
          id: true,
          userName: true,
        },
      });
      return drivers;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
