import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException
} from '@nestjs/common';
import type { PolicyActor as PolicyActorContext } from './policy.types';

export const PolicyActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PolicyActorContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ actor?: PolicyActorContext }>();

    if (!request.actor) {
      throw new InternalServerErrorException(
        'Policy actor context is not available on the request.'
      );
    }

    return request.actor;
  }
);
