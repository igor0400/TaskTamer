import { Request } from 'express';

export interface CustomReq extends Request {
  user: { sub: string; iat: number; exp: number };
}
