import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

const KEYS_FILE_PATH = path.join(__dirname, '../../.rsa_keys.json');
let keyPair: KeyPair | null = null;

/**
 * Initializes or retrieves the persistent RSA-2048 keypair used for in-transit
 * encryption of sensitive credentials from the browser to the backend.
 */
export function getRSAKeyPair(): KeyPair {
  if (keyPair) {
    return keyPair;
  }

  // Check if persistent key file exists
  try {
    if (fs.existsSync(KEYS_FILE_PATH)) {
      const raw = fs.readFileSync(KEYS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.publicKey && parsed.privateKey) {
        keyPair = parsed;
        return keyPair as KeyPair;
      }
    }
  } catch (err) {
    // If read fails, regenerate below
  }

  // Generate new keypair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  keyPair = { publicKey, privateKey };

  try {
    fs.writeFileSync(KEYS_FILE_PATH, JSON.stringify(keyPair, null, 2), 'utf-8');
  } catch (err) {
    // Write warning if disk is read-only
    console.warn('Could not persist RSA keys to disk:', err);
  }

  return keyPair;
}

export function getPublicKeyPEM(): string {
  return getRSAKeyPair().publicKey;
}

export function getPrivateKeyPEM(): string {
  return getRSAKeyPair().privateKey;
}

