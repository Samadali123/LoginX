"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authRouter = (0, express_1.Router)();
// Public Authentication Endpoints
authRouter.get('/public-key', auth_controller_1.getPublicKey);
authRouter.post('/register', auth_controller_1.register);
authRouter.post('/login', auth_controller_1.login);
authRouter.post('/logout', auth_controller_1.logout);
// Protected Identity & Profile Endpoints
authRouter.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.getMe);
exports.default = authRouter;
