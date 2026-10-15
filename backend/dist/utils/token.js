"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Generates a signed JWT Access Token for authenticated users.
 *
 * @param payload - User identity payload containing userId, email, and username
 * @param expiresIn - Token validity duration (defaults to ENV.JWT_EXPIRES_IN e.g. '7d')
 * @returns Encoded JWT string
 */
function generateToken(payload, expiresIn = env_1.ENV.JWT_EXPIRES_IN) {
    const options = {
        expiresIn: expiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, options);
}
/**
 * Verifies and decodes a JWT Access Token.
 *
 * @param token - Bearer or cookie JWT string
 * @returns Decoded TokenPayload
 * @throws Error if token is invalid or expired
 */
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
}
