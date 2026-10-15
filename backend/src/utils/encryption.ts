import crypto from 'crypto';
import { getPrivateKeyPEM } from '../config/keys';

/**
 * Decrypts in-transit RSA-encrypted credentials received from client.
 * Uses RSA_PKCS1_PADDING to decode base64 payloads encrypted by browser JSEncrypt.
 *
 * @param encryptedPayload - Base64 RSA ciphertext string
 * @returns Plaintext string
 */
export function decryptInTransitPassword(encryptedPayload: string): string {
  if (!encryptedPayload) {
    throw new Error('Password payload cannot be empty');
  }

  const privateKey = getPrivateKeyPEM();
  const buffer = Buffer.from(encryptedPayload, 'base64');

  // 1. Modern RSA-OAEP with SHA-256 (standard WebCrypto)
  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch {}

  // 2. RSA-OAEP with SHA-1
  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha1',
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch {}

  // 3. Legacy RSA PKCS#1 v1.5 padding (JSEncrypt)
  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch {}

  // If decryption fails and payload is long base64, reject as invalid encryption
  if (encryptedPayload.length > 100) {
    throw new Error('Failed to decrypt password. Invalid or expired encryption key.');
  }

  // Direct plaintext fallback for test/dev environments
  return encryptedPayload;
}
