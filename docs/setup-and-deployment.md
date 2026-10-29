# HotelPro — Setup, Configuration, and Deployment Guide

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (default port 27017) or MongoDB Atlas connection string. (Note: The backend also includes a resilient local in-memory fallback for zero-friction evaluation).

---

## 2. Project Directory Structure
```
HotelPro/
├── client/           # React + Vite frontend application
├── server/           # Node.js + Express backend application
├── docs/             # Full system architecture, API, and database docs
├── .gitignore        # Git rules
└── README.md         # Master project documentation
```

---

## 3. Local Development Setup

### 3.1 MongoDB Persistence Configuration
HotelPro connects to MongoDB using Mongoose. The database layer automatically detects your configuration:

1. **Option A: Local MongoDB Service (Persistent)**
   - Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
   - Ensure the MongoDB service is running:
     - On Windows (PowerShell/CMD as Admin):
       ```powershell
       net start MongoDB
       ```
     - Or start `mongod` manually:
       ```bash
       mongod --dbpath "C:\data\db"
       ```
   - In `server/.env`, verify:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/hotelpro
     ```
   - Data is stored permanently in your local MongoDB data directory.

2. **Option B: MongoDB Atlas Cloud Cluster (Persistent)**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Under Database Access, create a database user with read/write permissions.
   - Under Network Access, add `0.0.0.0/0` (or your current IP) to the IP access list.
   - Click **Connect** -> **Drivers** -> Copy the connection string.
   - In `server/.env`, set:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hotelpro?retryWrites=true&w=majority
     ```

3. **Option C: In-Memory MongoDB Fallback (Ephemeral Development)**
   - If no persistent MongoDB instance is reachable at `MONGODB_URI`, the server automatically spins up a singleton in-memory MongoDB instance (`mongodb-memory-server`) for zero-friction evaluation.
   - **Note on Persistence**: When running in this fallback mode, all database records exist in RAM and reset when the server process terminates. To persist data permanently, configure Option A or Option B.

### 3.2 Email & SMTP Configuration
The backend includes a transactional email service for booking confirmations, cancellations, and notifications:

1. **Development Logger Mode (Default)**
   - If `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS` are left empty, the application runs in safe console logger mode.
   - Outgoing emails are printed cleanly to the server terminal. No network calls are made and operations never fail due to missing mail server credentials.

2. **Production SMTP Configuration**
   - To send live emails, configure the following in `server/.env`:
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your_email@gmail.com
     SMTP_PASS=your_16_character_app_password
     EMAIL_FROM="HotelPro Reservations" <reservations@hotelpro.com>
     ```
   - For Gmail, use an **App Password** generated under Google Account Security (requires 2-Step Verification).
   - For development sandbox testing, [Mailtrap](https://mailtrap.io) is recommended (`SMTP_HOST=sandbox.smtp.mailtrap.io`, `SMTP_PORT=2525`).

### 3.3 Backend Setup (`server/`)
1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
4. Seed the database with realistic demo hotels, rooms, and test user accounts:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # Server will listen on http://localhost:8001
   ```

### 3.2 Frontend Configuration (`client/`)
1. Open a new terminal and navigate to `client/`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Add:
   ```env
   VITE_API_BASE_URL=http://localhost:8001/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   # Vite frontend will run on http://localhost:5173
   ```

---

## 4. Default Seed Credentials

After running `npm run seed` in the `server` folder, you can test all roles immediately:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@hotelpro.com` | `Admin@123` | Full dashboard, room management, user roles, analytics |
| **Staff** | `staff@hotelpro.com` | `Staff@123` | Front-desk operations, check-in, check-out, room cleaning |
| **Customer** | `customer@hotelpro.com` | `User@123` | Browse rooms, create reservations, payment, cancellation |

---

## 5. Production Build & Deployment

### 5.1 Frontend Build
```bash
cd client
npm run build
```
This produces an optimized static build in `client/dist/`. The backend Express server is configured to serve `client/dist/` in production if configured as a unified deployment, or `client/dist/` can be deployed independently to Vercel, Netlify, or Cloudflare Pages.

### 5.2 Production Backend
```bash
cd server
NODE_ENV=production npm start
```
Use a process manager such as `pm2` or a Docker container for production deployment.

