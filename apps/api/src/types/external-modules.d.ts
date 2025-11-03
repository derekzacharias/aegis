declare module 'passport-jwt' {
  import type { Request } from 'express';

  type JwtFromRequestFunction = (req: Request) => string | null;

  interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey: string | Buffer;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  type VerifyCallback = (error: any, user?: unknown, info?: unknown) => void;

  class Strategy {
    constructor(options: StrategyOptions, verify: (payload: any, done: VerifyCallback) => void);
  }

  const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
  };

  export { Strategy, ExtractJwt, StrategyOptions, JwtFromRequestFunction };
}

declare module 'multer' {
  import type { RequestHandler } from 'express';

  interface StorageEngine {}

  interface Limits {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  }

  interface MulterOptions {
    dest?: string;
    storage?: StorageEngine;
    limits?: Limits;
  }

  interface MulterInstance {
    single(fieldName: string): RequestHandler;
    array(fieldName: string, maxCount?: number): RequestHandler;
    fields(
      fields: ReadonlyArray<{
        name: string;
        maxCount?: number;
      }>
    ): RequestHandler;
    any(): RequestHandler;
    none(): RequestHandler;
  }

  interface MulterStatic {
    (options?: MulterOptions): MulterInstance;
    memoryStorage(): StorageEngine;
    diskStorage(options: {
      destination?:
        | string
        | ((
            req: import('express').Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void
          ) => void);
      filename?: (
        req: import('express').Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void
      ) => void;
    }): StorageEngine;
  }

  const multer: MulterStatic;
  export = multer;
}

declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer: Buffer;
    }
  }
}
