"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = validatePasswordStrength;
exports.validateEmail = validateEmail;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
/**
 * Validates password strength according to enterprise security policy:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
function validatePasswordStrength(password) {
    if (!password || password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number.' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one special character.' };
    }
    return { isValid: true };
}
/**
 * Validates strictly @gmail.com email address format.
 */
function validateEmail(email) {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(email.trim());
}
/**
 * Hashes plaintext password using bcrypt with 12 salt rounds.
 */
async function hashPassword(plainPassword) {
    const salt = await bcryptjs_1.default.genSalt(SALT_ROUNDS);
    return bcryptjs_1.default.hash(plainPassword, salt);
}
/**
 * Compares plaintext password against a stored bcrypt hash.
 */
async function verifyPassword(plainPassword, hash) {
    return bcryptjs_1.default.compare(plainPassword, hash);
}
