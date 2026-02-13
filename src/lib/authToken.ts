import { NextRequest } from 'next/server';

export const getTokenFromRequest = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const headerToken = req.headers.get('x-auth-token');
  if (headerToken) {
    return headerToken.trim();
  }

  return req.cookies.get('token')?.value;
};
