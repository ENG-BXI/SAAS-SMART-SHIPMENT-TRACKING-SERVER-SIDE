import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}
  async login(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        isAdmin: true,
        isDriver: true,
        isEmployee: true,
        isManager: true,
        password: true,
        id: true,
        email: true,
        userName: true,
        companyId: true,
        company: {
          select: {
            subscription: {
              select: {
                status: true,endDate:true
              },
            },
          },
        },
      },
    });
  }
}
