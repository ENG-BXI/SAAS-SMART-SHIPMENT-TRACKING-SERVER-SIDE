import express from 'express';
import { JwtUser } from 'src/Common/interfaces/jwt-user';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}
