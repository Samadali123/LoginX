"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRSAKeyPair = getRSAKeyPair;
exports.getPublicKeyPEM = getPublicKeyPEM;
exports.getPrivateKeyPEM = getPrivateKeyPEM;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const KEYS_FILE_PATH = path_1.default.join(__dirname, '../../.rsa_keys.json');
let keyPair = null;
/**
 * Initializes or retrieves the persistent RSA-2048 keypair used for in-transit
 * encryption of sensitive credentials from the browser to the backend.
 */
function getRSAKeyPair() {
    if (keyPair) {
        return keyPair;
    }
    // Check if persistent key file exists
    try {
        if (fs_1.default.existsSync(KEYS_FILE_PATH)) {
            const raw = fs_1.default.readFileSync(KEYS_FILE_PATH, 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed.publicKey && parsed.privateKey) {
                keyPair = parsed;
                return keyPair;
            }
        }
    }
    catch (err) {
        // If read fails, regenerate below
    }
    // Generate new keypair
    const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('rsa', {
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
        fs_1.default.writeFileSync(KEYS_FILE_PATH, JSON.stringify(keyPair, null, 2), 'utf-8');
    }
    catch (err) {
        // Write warning if disk is read-only
        console.warn('Could not persist RSA keys to disk:', err);
    }
    return keyPair;
}
function getPublicKeyPEM() {
    return getRSAKeyPair().publicKey;
}
function getPrivateKeyPEM() {
    return getRSAKeyPair().privateKey;
}
