import JSEncrypt from 'jsencrypt';

let cachedPublicKey: string | null = null;

export function clearCachedPublicKey(): void {
  cachedPublicKey = null;
}

/**
 * Converts a PEM-formatted RSA public key into an ArrayBuffer of SPKI DER bytes.
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  const raw = window.atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts data using the modern, zero-CVE browser Web Crypto API with RSA-OAEP (SHA-256).
 */
async function encryptWithSubtle(plainText: string, pemKey: string): Promise<string> {
  const binaryDer = pemToArrayBuffer(pemKey);
  const cryptoKey = await window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );

  const encoded = new TextEncoder().encode(plainText);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    cryptoKey,
    encoded
  );

  const bytes = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Fetches the backend's RSA public key for client-side password encryption.
 */
export async function fetchPublicKey(apiBaseUrl: string, forceFresh = false): Promise<string> {
  if (cachedPublicKey && !forceFresh) {
    return cachedPublicKey;
  }

  const response = await fetch(`${apiBaseUrl}/api/auth/public-key`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: forceFresh ? 'no-store' : 'default',
  });

  if (!response.ok) {
    cachedPublicKey = null;
    throw new Error('Unable to retrieve secure encryption key from server.');
  }

  const data = await response.json();
  if (!data.publicKey) {
    cachedPublicKey = null;
    throw new Error('Invalid encryption key received from server.');
  }

  cachedPublicKey = data.publicKey;
  return data.publicKey as string;
}

/**
 * Encrypts a password on the client side using RSA-2048 before transmission.
 * Uses native Web Crypto RSA-OAEP (SHA-256) with JSEncrypt fallback.
 */
export async function encryptPassword(plainPassword: string, apiBaseUrl: string): Promise<string> {
  const publicKey = await fetchPublicKey(apiBaseUrl);

  // 1. Try native Web Crypto RSA-OAEP (modern standard, fully compatible with Node 20+)
  if (window.crypto && window.crypto.subtle) {
    try {
      return await encryptWithSubtle(plainPassword, publicKey);
    } catch {
      // Retry once with forced fresh key
      try {
        const freshKey = await fetchPublicKey(apiBaseUrl, true);
        return await encryptWithSubtle(plainPassword, freshKey);
      } catch {
        // Fall back to JSEncrypt below
      }
    }
  }

  // 2. Fallback to JSEncrypt
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const encrypted = encryptor.encrypt(plainPassword);

  if (!encrypted) {
    const freshKey = await fetchPublicKey(apiBaseUrl, true);
    encryptor.setPublicKey(freshKey);
    const retryEncrypted = encryptor.encrypt(plainPassword);
    if (!retryEncrypted) {
      throw new Error('Failed to encrypt password payload.');
    }
    return retryEncrypted;
  }

  return encrypted;
}
