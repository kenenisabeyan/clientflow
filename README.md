# ClientFlow 🚀

ClientFlow is a robust, full-stack client portal and project management system designed to streamline agency-client interactions. It provides a centralized dashboard for managing projects, tasks, invoices, client communications, and real-time activity tracking.

Built with an architecture that cleanly separates the frontend React application from the backend Node/Express API, it offers secure, role-based access for Admins, Clients, and Developers.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/client`)
A modern, responsive Single Page Application (SPA) built with:
- **Framework:** React 19 + Vite for ultra-fast builds and HMR.
- **Routing:** React Router DOM v6 for seamless navigation.
- **UI Components:** Lucide React (Icons), Recharts (Data Visualization).
- **Styling:** Custom CSS with a robust design system (`index.css`).
- **Language:** TypeScript for type safety and better developer experience.

### Backend (`/server`)
A secure REST API built with:
- **Runtime/Framework:** Node.js + Express.js.
- **Database ORM:** Prisma ORM / MongoDB.
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs for secure password hashing.
- **File Handling:** Multer for handling project file uploads.
- **Language:** TypeScript (`ts-node` for execution).

---

## 🗂️ Project Structure

```
clientflow/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── api/            # API client configurations (Axios)
│   │   ├── components/     # Reusable UI components (Layout, Modals)
│   │   ├── context/        # React Context providers (AuthContext, ThemeContext)
│   │   ├── pages/          # App pages (Dashboard, Projects, Tasks, etc.)
│   │   ├── App.tsx         # Main router and app structure
│   │   ├── index.css       # Global stylesheet and theme tokens
│   │   └── main.tsx        # React entry point
│   ├── index.html          # HTML entry point
│   ├── package.json        # Frontend dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── vite.config.ts      # Vite configuration
├── server/                 # Express backend API
│   ├── config/             # DB & environment configuration
│   ├── controllers/        # Route controllers & business logic
│   ├── middleware/         # Auth, role, and file upload middleware
│   ├── models/             # Data models and schemas
│   ├── prisma/             # Prisma schema & migrations
│   ├── routes/             # API routes
│   ├── utils/              # Helper utilities & validators
│   ├── package.json        # Backend dependencies
│   ├── server.ts           # Server entry point
│   └── tsconfig.json       # Backend TypeScript config
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB or PostgreSQL (depending on configured database)
- npm or pnpm

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment template and configure variables:
cp .env.example .env

# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite development server
npm run dev
```

---

## 🔒 Security & Roles
ClientFlow utilizes a robust Role-Based Access Control (RBAC) system:
- **Admin**: Full access to all projects, user management, global reports, and system settings.
- **Developer**: Access to assigned projects, ability to manage tasks, and communicate with clients.
- **Client**: Restricted view limited to their specific projects, invoices, and communication threads.