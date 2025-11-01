import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException
} from '@nestjs/common';
import { PolicyActor } from './policy.types';

export const PolicyActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PolicyActor => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ actor?: PolicyActor }>();

    if (!request.actor) {
      throw new InternalServerErrorException(
        'Policy actor context is not available on the request.'
      );
    }

    return request.actor;
  }
);
