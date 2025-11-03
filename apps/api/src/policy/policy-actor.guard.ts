import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type { PolicyActor } from './policy.types';

@Injectable()
export class PolicyActorGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { actor?: PolicyActor }>();

    const headerActorId = request.header('x-actor-id');
    const rawQueryActorId = request.query['actorId'];
    const queryActorId =
      typeof rawQueryActorId === 'string'
        ? rawQueryActorId
        : Array.isArray(rawQueryActorId) && typeof rawQueryActorId[0] === 'string'
        ? rawQueryActorId[0]
        : undefined;
    const headerActorEmail = request.header('x-actor-email');

    const actorId = headerActorId ?? queryActorId;

    const actor = actorId
      ? await this.prisma.user.findUnique({
          where: { id: actorId }
        })
      : headerActorEmail
      ? await this.prisma.user.findUnique({
          where: { email: headerActorEmail }
        })
      : null;

    if (!actor) {
      throw new UnauthorizedException(
        'Provide X-Actor-Id or X-Actor-Email header to perform policy actions.'
      );
    }

    request.actor = {
      id: actor.id,
      email: actor.email,
      firstName: actor.firstName,
      lastName: actor.lastName,
      role: actor.role,
      organizationId: actor.organizationId
    };

    return true;
  }
}
