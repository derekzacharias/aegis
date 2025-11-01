import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows public routes to bypass passport', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true)
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);
    const superSpy = jest.spyOn(
      Object.getPrototypeOf(JwtAuthGuard.prototype),
      'canActivate'
    );

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn()
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(superSpy).not.toHaveBeenCalled();
  });

  it('delegates to passport when route is protected', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false)
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);
    const superSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true as unknown as boolean);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn()
    } as unknown as ExecutionContext;
    const result = guard.canActivate(context);

    expect(superSpy).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
  });
});
