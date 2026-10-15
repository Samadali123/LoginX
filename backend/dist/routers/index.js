"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_router_1 = __importDefault(require("./auth.router"));
exports.authRouter = auth_router_1.default;
const rootRouter = (0, express_1.Router)();
// Mount authentication router under /auth
rootRouter.use('/auth', auth_router_1.default);
exports.default = rootRouter;
