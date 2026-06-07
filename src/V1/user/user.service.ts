import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { UserMapper } from './user.mapper';
import { hashPassword } from 'src/Common/lib';
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
  ) {}
  async getAllUsers(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const users = await this.userRepository.getAllUsers(
        companyId,
        page,
        limit,
        search,
      );
      const userCount = await this.userRepository.getCountOfAllUser(
        companyId,
        search,
      );
      const allUsers = UserMapper.toList(users);
      return { users: allUsers, userCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createNewUser(userDto: CreateUserDto, companyId: string) {
    try {
      const existingUser = await this.userRepository.getUserById(
        userDto.email,
        companyId,
      );
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = hashPassword(userDto.password);
      const user = await this.userRepository.createUser(
        userDto,
        companyId,
        hashedPassword,
      );
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
      const existingUser = await this.userRepository.getUserById(
        companyId,
        userDto.email,
      );
      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      let hashedPassword = existingUser.password;
      if (userDto.password) {
        hashedPassword = hashPassword(userDto.password);
      }
      const existEmail = await this.userRepository.isEmailAlreadyTaken(
        userDto.email!,
        companyId,
        userId,
      );
      if (existEmail) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      const user = await this.userRepository.updateUser(
        userDto,
        companyId,
        userId,
        hashedPassword,
      );
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
      const existingUser = await this.userRepository.getUserById(
        companyId,
        undefined,
        userId,
      );
      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      const user = await this.userRepository.deleteUser(companyId, userId);
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getAllDrivers(companyId: string) {
    try {
      const drivers = await this.userRepository.getAllDrivers(companyId);
      return drivers;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
