import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding default users...');

  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const users = [
    {
      name: 'Default Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
    {
      name: 'Default Contractor',
      email: 'contractor@example.com',
      password: hashedPassword,
      role: 'contractor',
    },
    {
      name: 'Default User',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'user',
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isActive: true,
      },
    });
    console.log(`✅ ${userData.role.toUpperCase()} created/verified: ${user.email}`);
  }

  console.log('\n✨ Seeding completed!');
  console.log('Credentials:');
  console.log(' - Admin: admin@example.com / password123');
  console.log(' - Contractor: contractor@example.com / password123');
  console.log(' - User: user@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
