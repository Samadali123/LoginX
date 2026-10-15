# LoginX — Official Citizen Authentication & Portal Platform

> A full-stack, enterprise-grade authentication platform engineered with end-to-end asymmetric password encryption, HTTP-Only session isolation, PostgreSQL/Supabase persistence via Prisma, and an architectural luxury design system.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Security & Cryptography](#-security--cryptography)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

## 🌟 Overview

LoginX provides a secure identity layer designed to prevent credential interception, replay attacks, and token theft:
- **In-Transit Password Shield:** Passwords are encrypted on the client device using browser-native **Web Crypto RSA-OAEP (SHA-256)** before transmission across the network.
- **Server-Side Decryption & Hashing:** The backend decrypts incoming payloads with an isolated RSA private key and stores them using **Bcrypt with 12 salt rounds**.
- **Secure Cookie Session:** Access tokens are signed JWTs with a 15-minute expiration stored inside **HTTP-Only, SameSite, Secure cookies** (immune to XSS script access).
- **Executive Citizen Portal:** Verified profile view displaying authenticated credentials, registration date, and security specifications.

---

## 🏗 Architecture & Tech Stack

```mermaid
flowchart LR
    subgraph Browser ["Frontend (React 18 + Vite)"]
        UI[Luxury UI & Popups]
        Subtle[WebCrypto RSA-OAEP]
    end

    subgraph Server ["Backend (Node.js + Express)"]
        Decipher[RSA Private Decryption]
        Bcrypt[Bcrypt Hashing - 12 Rounds]
        JWT[15m JWT Signer]
    end

    subgraph Storage ["Database (Supabase PostgreSQL)"]
        Prisma[Prisma ORM]
        DB[(User Table)]
    end

    UI -->|1. Fetch Public Key| Server
    Subtle -->|2. Encrypted Password Payload| Decipher
    Decipher -->|3. Validate & Hash| Bcrypt
    Bcrypt -->|4. Store Record| Prisma --> DB
    JWT -->|5. HTTP-Only Cookie| Browser
```

### Frontend
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Routing:** React Router v6
- **Cryptography:** Native `window.crypto.subtle` (RSA-OAEP, SHA-256) with JSEncrypt fallback
- **Icons:** Lucide React
- **Styling:** Vanilla CSS with custom architectural luxury design system (half-white canvas, precision dot grid, glassmorphism)

### Backend
- **Runtime:** Node.js (v20+) with TypeScript
- **Framework:** Express.js
- **ORM:** Prisma ORM 5.x
- **Database:** PostgreSQL (Supabase Connection Pooler & Direct Connection)
- **Security:** Node `crypto` module, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `cors`

---

## 🛡️ Security & Cryptography

1. **Client-Side Encryption:**
   - On page interaction, the client queries `GET /api/auth/public-key` to fetch the server's RSA-2048 public key in SPKI PEM format.
   - Passwords are encrypted locally with `RSA-OAEP` and `SHA-256` hashing. Plaintext passwords never leave the browser.
2. **Server-Side In-Transit Decryption:**
   - Backend `decryptInTransitPassword()` attempts RSA-OAEP decryption with SHA-256, falling back to SHA-1 or PKCS#1 v1.5 if needed.
3. **Password Policy & Email Domain:**
   - Password requirements: 8+ characters, uppercase, lowercase, number, and special symbol.
   - Strict email validation: Only `@gmail.com` addresses are permitted for registration and authentication.
4. **Token Security:**
   - Tokens expire after 15 minutes (`JWT_EXPIRES_IN="15m"`).
   - Stored in `accessToken` HTTP-Only cookie with `SameSite: 'lax'` (development) / `'none'` (production).

---

## 📁 Project Structure

```text
LoginX/
├── README.md                      # Unified documentation for both apps
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Prisma schema definition (User model)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts             # Typed environment configuration
│   │   │   └── keys.ts            # Persistent RSA-2048 keypair generator
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts # Register, Login, Logout, Session handlers
│   │   │   └── index.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts # HTTP-Only cookie JWT verification
│   │   ├── routers/
│   │   │   ├── auth.router.ts     # Auth endpoints routing
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── encryption.ts      # RSA private key decryption
│   │   │   ├── password.ts        # Bcrypt hashing & Gmail validation
│   │   │   └── token.ts           # JWT generation & verification
│   │   ├── app.ts                 # Express app configuration & middleware
│   │   └── index.ts               # HTTP server entrypoint (port 5000)
│   ├── .env                       # Backend environment configuration
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   │   └── Logo.png           # Official LoginX brand identity asset
    │   ├── components/
    │   │   ├── AuthModal.tsx      # Sign In / Sign Up popup modal
    │   │   └── ProtectedRoute.tsx # Route guard for /portal
    │   ├── context/
    │   │   └── AuthContext.tsx    # Global user session provider
    │   ├── pages/
    │   │   ├── Landing.tsx        # Hero landing page & popup triggers
    │   │   └── Home.tsx           # Executive citizen identity portal
    │   ├── services/
    │   │   ├── api.ts             # Credentials-enabled API service
    │   │   └── crypto.ts          # WebCrypto RSA-OAEP client encryption
    │   ├── App.tsx                # Client routing
    │   ├── index.css              # Design system tokens and styles
    │   └── main.tsx               # React DOM entrypoint
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or higher recommended)
- [npm](https://www.npmjs.com/) (v10.x or higher)
- A [Supabase](https://supabase.com/) PostgreSQL database instance

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file in `backend/.env` with your Supabase credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Supabase Transaction Connection Pooler (port 6543)
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Supabase Direct Connection (port 5432) for migrations
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

   # Authentication
   JWT_SECRET="your_long_random_jwt_secret_string"
   JWT_EXPIRES_IN="15m"
   COOKIE_NAME="accessToken"
   ```

   > **Note on Special Characters in Database Passwords:** If your database password contains `@`, encode it as `%40` (e.g. `Secret@123` becomes `Secret%40123`).

4. Push the database schema to your Supabase PostgreSQL instance:
   ```bash
   npm run prisma:push
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify or create your `frontend/.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `5000` |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `FRONTEND_URL` | Allowed CORS origin for credentials | `http://localhost:5173` |
| `DATABASE_URL` | Supabase connection pooler URL (Port 6543) | `postgresql://...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct PostgreSQL URL (Port 5432) | `postgresql://...:5432/postgres` |
| `JWT_SECRET` | Secret key for signing and verifying tokens | `your_secret_string` |
| `JWT_EXPIRES_IN` | Token validity duration | `15m` |
| `COOKIE_NAME` | Name of the HTTP-Only authentication cookie | `accessToken` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## 📡 API Endpoints

All auth routes are prefixed with `/api/auth`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/auth/public-key` | Returns the RSA-2048 public key in SPKI PEM format | No |
| `POST` | `/api/auth/register` | Registers a new user with in-transit encrypted password | No |
| `POST` | `/api/auth/login` | Authenticates user and issues HTTP-Only cookie | No |
| `POST` | `/api/auth/logout` | Clears authentication cookie and terminates session | Yes |
| `GET` | `/api/auth/me` | Returns the profile data of the currently authenticated user | Yes |
| `GET` | `/health` | Server health status check | No |

---

## 🔒 Security Best Practices Implemented

- **No Plaintext Passwords Over the Wire:** In-transit RSA-2048 client-side cipher ensures credentials cannot be intercepted by network sniffers or reverse proxies.
- **Bcrypt (12 Rounds):** Robust salt rounds defend against offline dictionary and brute-force GPU attacks.
- **XSS-Resistant Cookies:** Session tokens cannot be accessed via JavaScript (`document.cookie`), preventing credential exfiltration.
- **Strict Input Validation:** Enforced username length, `@gmail.com` domain restriction, and password complexity check on both client and server layers.
- **Zero Console 401 Leaks:** Eager unauthenticated requests are eliminated; session status is queried only on protected routes.

---

## 📄 License
MIT © 2026 LoginX Inc. Designed with zero-knowledge privacy and end-to-end security.
