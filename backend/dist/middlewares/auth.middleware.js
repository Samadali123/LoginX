"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const token_1 = require("../utils/token");
const env_1 = require("../config/env");
function authenticateToken(req, res, next) {
    // Read accessToken from HTTP-only cookie first, fallback to Authorization Bearer header
    const token = req.cookies?.[env_1.ENV.COOKIE_NAME] ||
        (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access denied. No active session or token provided.',
        });
        return;
    }
    try {
        const decoded = (0, token_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: 'Session expired or invalid. Please sign in again.',
        });
    }
}
