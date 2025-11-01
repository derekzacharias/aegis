import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

const createContext = (user?: { role: UserRole }) =>
  ({
    getClass: () => ({}),
    getHandler: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user
      })
    })
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn()
  } as unknown as Reflector;

  const guard = new RolesGuard(reflector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access for public routes', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce(true);

    const result = guard.canActivate(createContext());

    expect(result).toBe(true);
  });

  it('allows when no roles required', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([]);

    const result = guard.canActivate(createContext({ role: UserRole.READ_ONLY }));

    expect(result).toBe(true);
  });

  it('allows when user role matches', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([UserRole.ANALYST, UserRole.ADMIN]);

    const result = guard.canActivate(createContext({ role: UserRole.ANALYST }));

    expect(result).toBe(true);
  });

  it('allows admins regardless of requirement', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([UserRole.AUDITOR]);

    const result = guard.canActivate(createContext({ role: UserRole.ADMIN }));

    expect(result).toBe(true);
  });

  it('denies when requirements unmet', () => {
    (reflector.getAllAndOverride as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([UserRole.ADMIN]);

    const result = guard.canActivate(createContext({ role: UserRole.AUDITOR }));

    expect(result).toBe(false);
  });
});
