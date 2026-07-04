import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_ROLE } from 'src/Common/constant/user-role';
import { AuthRepository } from './auth.repository';
import { SubscriptionRepository } from '../subscription/subscription.repository';
import { SubscriptionStatus } from 'generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private subscriptionRepository: SubscriptionRepository,
  ) {}
  async login(loginDto: LoginDto) {
    const user = await this.authRepository.login(loginDto.email);
    // Check if user exist
    if (!user) {
      throw new Error('email or password is not correct');
    }
    // TODO : Denied Client Form Dashboard
    // Denied driver from dashboard
    if (user.isDriver) throw new Error('email or password is not correct');
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    // Check if password is correct
    if (!isPasswordValid) {
      throw new Error('email or password is not correct');
    }
    let status = user.company?.subscription?.status;
    const date = new Date();
    if (
      user?.company?.subscription?.endDate &&
      user.company.subscription.endDate < date
    ) {
      if (status != 'change')
        await this.subscriptionRepository.expireSubscriptionOfCompany(
          user.companyId!,
        );
      status = SubscriptionStatus.expired;
    }
    if (user.isAdmin) {
      status = SubscriptionStatus.active;
    }
    const role = user.isAdmin
      ? USER_ROLE.ADMIN
      : user.isManager
        ? USER_ROLE.MANAGER
        : user.isEmployee
          ? USER_ROLE.EMPLOYEE
          : user.isDriver
            ? USER_ROLE.DRIVER
            : null;
    const payload = {
      id: user.id,
      name: user.userName,
      email: user.email,
      companyId: user.companyId,
      role: role,
      status,
    };
    return this.jwtService.sign(payload);
  }
}
