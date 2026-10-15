"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicKey = getPublicKey;
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getMe = getMe;
const prisma_1 = require("../lib/prisma");
const token_1 = require("../utils/token");
const password_1 = require("../utils/password");
const encryption_1 = require("../utils/encryption");
const keys_1 = require("../config/keys");
const env_1 = require("../config/env");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_1.ENV.NODE_ENV === 'production',
    sameSite: (env_1.ENV.NODE_ENV === 'production' ? 'none' : 'lax'),
    maxAge: 15 * 60 * 1000, // 15 minutes (matches JWT_EXPIRES_IN)
    path: '/',
};
/**
 * GET /api/auth/public-key
 * Returns RSA public key in PEM format for in-transit password encryption.
 */
async function getPublicKey(req, res) {
    try {
        const publicKey = (0, keys_1.getPublicKeyPEM)();
        res.status(200).json({
            success: true,
            publicKey,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve encryption public key',
        });
    }
}
/**
 * POST /api/auth/register
 * Handles account creation with duplicate detection and password encryption.
 */
async function register(req, res) {
    try {
        const { email, username, encryptedPassword, password } = req.body;
        // Basic presence checks
        if (!email || typeof email !== 'string') {
            res.status(400).json({ success: false, message: 'Valid email address is required' });
            return;
        }
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            res.status(400).json({
                success: false,
                message: 'Username is required and must be at least 3 characters',
            });
            return;
        }
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedUsername = username.trim();
        if (!(0, password_1.validateEmail)(trimmedEmail)) {
            res.status(400).json({
                success: false,
                message: 'Only Gmail addresses are permitted (e.g. name@gmail.com)',
            });
            return;
        }
        // Decrypt in-transit encrypted password
        const rawCipher = encryptedPassword || password;
        if (!rawCipher) {
            res.status(400).json({ success: false, message: 'Password is required' });
            return;
        }
        let plainPassword = '';
        try {
            plainPassword = (0, encryption_1.decryptInTransitPassword)(rawCipher);
        }
        catch (decryptErr) {
            res.status(400).json({
                success: false,
                message: decryptErr.message || 'Decryption failed for secure password payload',
            });
            return;
        }
        // Validate password complexity
        const passwordValidation = (0, password_1.validatePasswordStrength)(plainPassword);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: passwordValidation.message,
            });
            return;
        }
        // Check duplicate registrations
        try {
            const existingEmail = await prisma_1.prisma.user.findUnique({
                where: { email: trimmedEmail },
            });
            const existingUsername = await prisma_1.prisma.user.findUnique({
                where: { username: trimmedUsername },
            });
            if (existingEmail || existingUsername) {
                res.status(409).json({
                    success: false,
                    message: 'Already Registered',
                });
                return;
            }
            // Hash password with bcrypt (12 rounds)
            const hashedPassword = await (0, password_1.hashPassword)(plainPassword);
            // Create user record in PostgreSQL via Prisma
            const newUser = await prisma_1.prisma.user.create({
                data: {
                    email: trimmedEmail,
                    username: trimmedUsername,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true,
                },
            });
            // Generate JWT Access Token
            const token = (0, token_1.generateToken)({
                userId: newUser.id,
                email: newUser.email,
                username: newUser.username,
            });
            // Set secure HTTP-only cookie
            res.cookie(env_1.ENV.COOKIE_NAME, token, COOKIE_OPTIONS);
            res.status(201).json({
                success: true,
                message: 'Signed up successfully in LoginX',
                user: newUser,
                accessToken: token, // Also return for client awareness if needed
            });
        }
        catch (dbError) {
            console.error('Database error during registration:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error. Please check your Supabase connection string in backend .env and run migrations.',
            });
        }
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
        });
    }
}
/**
 * POST /api/auth/login
 * Handles user login with encrypted password and session cookie.
 */
async function login(req, res) {
    try {
        const { email, emailOrUsername, encryptedPassword, password } = req.body;
        const emailInput = (email || emailOrUsername || '').trim();
        if (!emailInput) {
            res.status(400).json({
                success: false,
                message: 'Email address is required',
            });
            return;
        }
        const rawCipher = encryptedPassword || password;
        if (!rawCipher) {
            res.status(400).json({
                success: false,
                message: 'Password is required',
            });
            return;
        }
        // Decrypt in-transit encrypted password
        let plainPassword = '';
        try {
            plainPassword = (0, encryption_1.decryptInTransitPassword)(rawCipher);
        }
        catch (decryptErr) {
            res.status(400).json({
                success: false,
                message: 'Failed to decrypt secure credentials',
            });
            return;
        }
        try {
            // Find user strictly by email
            const user = await prisma_1.prisma.user.findFirst({
                where: {
                    email: { equals: emailInput, mode: 'insensitive' },
                },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Email or Password is incorrect',
                });
                return;
            }
            // Verify bcrypt hash
            const isPasswordMatch = await (0, password_1.verifyPassword)(plainPassword, user.password);
            if (!isPasswordMatch) {
                res.status(401).json({
                    success: false,
                    message: 'Email or Password is incorrect',
                });
                return;
            }
            // Generate JWT Access Token
            const token = (0, token_1.generateToken)({
                userId: user.id,
                email: user.email,
                username: user.username,
            });
            // Set secure HTTP-only cookie
            res.cookie(env_1.ENV.COOKIE_NAME, token, COOKIE_OPTIONS);
            res.status(200).json({
                success: true,
                message: 'Signed in successfully in LoginX',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    createdAt: user.createdAt,
                },
                accessToken: token,
            });
        }
        catch (dbError) {
            console.error('Database error during login:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database connection error. Please verify your Supabase credentials in backend .env',
            });
        }
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
        });
    }
}
/**
 * POST /api/auth/logout
 * Clears the accessToken cookie and ends the user session.
 */
async function logout(req, res) {
    try {
        res.clearCookie(env_1.ENV.COOKIE_NAME, {
            httpOnly: true,
            secure: env_1.ENV.NODE_ENV === 'production',
            sameSite: (env_1.ENV.NODE_ENV === 'production' ? 'none' : 'lax'),
            path: '/',
        });
        res.status(200).json({
            success: true,
            message: 'Signed out successfully from LoginX',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error signing out',
        });
    }
}
/**
 * GET /api/auth/me
 * Protected endpoint returning the authenticated user profile.
 */
async function getMe(req, res) {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User record not found' });
            return;
        }
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (dbError) {
        console.error('Database error in getMe:', dbError);
        res.status(500).json({
            success: false,
            message: 'Database query error',
        });
    }
}
