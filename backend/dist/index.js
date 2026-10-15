"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const keys_1 = require("./config/keys");
// Initialize RSA in-transit encryption keypair on startup
(0, keys_1.getRSAKeyPair)();
const PORT = env_1.ENV.PORT;
app_1.default.listen(PORT, () => {
    console.log(`backend app is working on port ${PORT}`);
});
