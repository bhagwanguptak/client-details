import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create secure hashes for the "passwords" (using phone numbers as passwords here)
  const adminPhoneHash = await bcrypt.hash('9999999999', 10);
  const clientPhoneHash = await bcrypt.hash('8888888888', 10);

  console.log('Cleaning up database...');
  // Optional: Uncomment the next line if you want to clear existing users before seeding
  // await prisma.user.deleteMany({});

  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "System Admin",
        email: "admin@ca.com",
        phoneHash: adminPhoneHash, // Fixed variable name
        role: "ADMIN",
        active: true,
      },
      {
        name: "Test Client",      // Added the missing required name
        email: "client@ca.com",
        phoneHash: clientPhoneHash,
        role: "CLIENT",
        active: true,             // Added active status
      },
    ],
  });

  console.log('✅ Seeded admin & client users successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });