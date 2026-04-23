import ms from 'ms';
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}
export const CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '1h') as ms.StringValue,
};
