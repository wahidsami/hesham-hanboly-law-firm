import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { prisma, verifyPassword } from './db';
import { config } from './config';

export const parseCookies = (cookieHeader: string | undefined) =>
  Object.fromEntries(
    (cookieHeader || '')
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separatorIndex = item.indexOf('=');
        if (separatorIndex < 0) {
          return [item, ''];
        }

        return [
          decodeURIComponent(item.slice(0, separatorIndex)),
          decodeURIComponent(item.slice(separatorIndex + 1)),
        ];
      }),
  );

export const setAuthCookie = (response: Response, token: string) => {
  response.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (response: Response) => {
  response.clearCookie('admin_session', { path: '/' });
};

export const createSessionToken = () => crypto.randomBytes(32).toString('hex');

export const requireAdmin = async (request: Request, response: Response, next: NextFunction) => {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.admin_session;

  if (!token) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt < new Date()) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  (request as Request & { adminUserId?: string }).adminUserId = session.adminUserId;
  next();
};

export const loginWithUsernamePassword = async (username: string, password: string) => {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + config.sessionDays * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      token,
      expiresAt,
      adminUserId: user.id,
    },
  });

  return { token, username: user.username };
};

export const logoutCurrentSession = async (request: Request) => {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.admin_session;
  if (!token) {
    return;
  }

  await prisma.adminSession.deleteMany({ where: { token } });
};

export const currentSession = async (request: Request) => {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.admin_session;
  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.adminUser;
};
