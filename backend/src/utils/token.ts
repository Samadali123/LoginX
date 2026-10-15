import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

/**
 * Generates a signed JWT Access Token for authenticated users.
 *
 * @param payload - User identity payload containing userId, email, and username
 * @param expiresIn - Token validity duration (defaults to ENV.JWT_EXPIRES_IN e.g. '7d')
 * @returns Encoded JWT string
 */
export function generateToken(payload: TokenPayload, expiresIn: string = ENV.JWT_EXPIRES_IN): string {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, ENV.JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT Access Token.
 *
 * @param token - Bearer or cookie JWT string
 * @returns Decoded TokenPayload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
}
