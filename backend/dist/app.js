"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const routers_1 = require("./routers");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
// HTTP Request Logging with morgan
app.use((0, morgan_1.default)(env_1.ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Allowed origins for CORS (with credentials for HTTP-only cookies)
const allowedOrigins = [
    env_1.ENV.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'LoginX API', timestamp: new Date().toISOString() });
});
// Authentication API
app.use('/api/auth', routers_1.authRouter);
// Locate the frontend static build folder (backend/dist or frontend/dist)
const candidateDistPaths = [
    path_1.default.join(__dirname, '../dist'),
    path_1.default.join(process.cwd(), 'dist'),
    path_1.default.join(__dirname, '../../frontend/dist'),
    path_1.default.join(process.cwd(), '../frontend/dist'),
];
const frontendDist = candidateDistPaths.find((dir) => fs_1.default.existsSync(dir) && fs_1.default.existsSync(path_1.default.join(dir, 'index.html')));
if (frontendDist) {
    app.use(express_1.default.static(frontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/health')
            return next();
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
// Fallback 404 handler for API routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});
exports.default = app;
