const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
import crypto from "crypto";

const phoneHash = crypto
  .createHash("sha256")
  .update("9999999999")
  .digest("hex")

const prisma = new PrismaClient();

async function main() {
  const adminPhoneHash = await bcrypt.hash('9999999999', 10);
  const clientPhoneHash = await bcrypt.hash('8888888888', 10);

  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
          {
        name: "Admin",
        email: "admin@ca.com",
        phoneHash,
        role: "ADMIN",
        active: true,
      },
      {
        email: 'client@ca.com',
        phoneHash: clientPhoneHash,
        role: 'CLIENT',
      },
    ],
  });

  console.log('✅ Seeded admin & client users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
