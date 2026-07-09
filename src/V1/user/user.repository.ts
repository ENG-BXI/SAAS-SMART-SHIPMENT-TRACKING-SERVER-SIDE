import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_ROLE } from 'src/Common/constant/user-role';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}
  async getAllUsers(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { companyId: companyId },
          search
            ? {
                OR: [
                  {
                    userName: { contains: search, mode: 'insensitive' },
                  },
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
    return users;
  }
  async getCountOfAllUser(companyId: string, search?: string) {
    const userCount = await this.prisma.user.count({
      where: {
        AND: [
          { companyId: companyId },
          search
            ? {
                OR: [
                  {
                    userName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    email: { contains: search, mode: 'insensitive' },
                  },
                ],
              }
            : {},
        ],
      },
    });
    return userCount;
  }
  async getUserById(companyId: string, email?: string, userId?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        AND: [
          {
            companyId: companyId,
          },
          {
            OR: [
              {
                email,
                id: userId,
              },
            ],
          },
        ],
      },
    });
    return existingUser;
  }
  async createUser(userDto: CreateUserDto, companyId: string, hashedPassword) {
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
    return user;
  }
  async isEmailAlreadyTaken(email: string, companyId: string, userId: string) {
    const isUser = await this.prisma.user.findFirst({
      where: {
        email: email,
        companyId: companyId,
        id: {
          not: userId,
        },
      },
    });
    return isUser;
  }
  async updateUser(
    userDto: UpdateUserDto,
    companyId: string,
    userId: string,
    hashedPassword: string,
  ) {
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
    return user;
  }
  async deleteUser(companyId: string, userId: string) {
    const user = await this.prisma.user.delete({
      where: { id: userId, companyId: companyId },
      select: {
        email: true,
        userName: true,
      },
    });
    return user;
  }
  async getAllDrivers(companyId: string) {
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
  }
  async getInfoOfDriver(companyId: string, driverId: string) {
    return await this.prisma.user.findUnique({
      where: { id: driverId, companyId },
      select: {
        userName: true,
        company: {
          select: {
            name: true,
            users: {
              select: { email: true, userName: true },
              where: { isEmployee: true },
              take: 1,
              orderBy: { createAt: 'asc' },
            },
          },
        },
      },
    });
  }
}
