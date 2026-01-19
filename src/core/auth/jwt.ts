import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;                 // 👈 standard
  role: 'ADMIN' | 'CLIENT';
}

export function signJwt(user: { id: string; role: 'ADMIN' | 'CLIENT' }) {
  return jwt.sign(
    { role: user.role },        // payload
    process.env.JWT_SECRET!,
    {
      subject: user.id,         // 👈 THIS sets `sub`
      expiresIn: '1d',
    }
  );
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}
