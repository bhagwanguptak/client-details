import { NextResponse } from 'next/server';
import { getAuthUser } from './auth';

export async function requireRole(
  allowed: Array<'ADMIN' | 'CLIENT'>
) {
  const user = await getAuthUser();

  if (!user || !allowed.includes(user.role)) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  return user;
}
