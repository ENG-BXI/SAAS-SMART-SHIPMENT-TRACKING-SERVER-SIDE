import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'abdo@gmail.com';
  const plainPassword = '123456789';
  const userName = 'admin';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin already exists, skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.create({
    data: {
      userName,
      email,
      password: hashedPassword,
      isAdmin: true,
      isManager: false,
      isEmployee: false,
      isDriver: false,
    },
  });

  console.log('✅ Admin created successfully:');
  console.log({
    id: admin.id,
    email: admin.email,
    userName: admin.userName,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
