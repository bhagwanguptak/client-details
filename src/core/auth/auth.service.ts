import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signJwt } from './jwt';

export async function login(email: string, phone: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(phone, user.phoneHash);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return signJwt({
    id: user.id,
    role: user.role,
  });
}
