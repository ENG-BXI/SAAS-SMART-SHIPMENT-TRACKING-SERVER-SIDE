import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_ROLE, USER_ROLE_FIELD } from '../../Common/constant/user-role';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async createNewUser(userDto: CreateUserDto, companyId: string) {
    try {
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
}
