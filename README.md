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
- **Runtime/Framework:** Node.js + Express.js 5.x.
- **Database ORM:** Prisma ORM.
- **Database:** PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs for secure password hashing.
- **File Handling:** Multer for handling project file uploads.
- **Language:** TypeScript (`ts-node` for execution).

---

## 🗂️ Project Structure

The repository is structured as a monorepo containing both the client and the server logic.

### Client Directory (`/client/src`)
- **`/api`**: Centralized Axios API instances and request handlers for fetching data from the backend.
- **`/components`**: Reusable UI components.
  - `Layout.tsx`: The main application shell and sidebar logic.
  - `Modals.tsx`: Reusable overlay components for creating projects, tasks, etc.
- **`/context`**: React Context API wrappers for state management (e.g., Auth, Theme).
- **`/pages`**: Represents distinct views in the application:
  - `Login.tsx` / `Register.tsx`: Authentication flows.
  - `Dashboard.tsx`: Main overview with charts and summary metrics.
  - `Projects.tsx` / `ProjectDetail.tsx` / `CreateProject.tsx`: Project management views.
  - `Tasks.tsx`: Kanban/list views for project tasks.
  - `Clients.tsx` / `UserManagement.tsx`: Admin views for managing platform users.
  - `Invoices.tsx`: Billing and financial tracking.
  - `Messages.tsx` / `Activity.tsx`: Communication and audit logs.
  - `Calendar.tsx`: Schedule and deadline tracking.
  - `Reports.tsx`: Comprehensive data analytics views.
  - `Settings.tsx`: User profile and application configuration.

### Server Directory (`/server`)
- **`/prisma`**: Database configuration and migration files.
  - `schema.prisma`: The core data models for the application.
- **`/controllers`**: Core business logic handling incoming requests.
  - `authController.ts`, `projectController.ts`, `taskController.ts`, `userController.ts`, `activityController.ts`, `commentController.ts`.
- **`/routes`**: Express route definitions mapping HTTP endpoints to specific controllers.
- **`/middleware`**: Express middleware (e.g., JWT token verification, role-based access).
- **`/utils`**: Helper functions (e.g., error formatting, password validation).
- **`server.ts`**: The main entry point to initialize the Express application and connect to PostgreSQL.

---

## 💾 Database Schema (Prisma Models)

The PostgreSQL database is structured around the following relational models:

1. **User**: Handles authentication and roles (`admin`, `client`, `developer`). Has relationships to Projects, Tasks, and Comments.
2. **Project**: The core entity connecting Clients to Tasks and Files. Tracks status (`pending`, `in-progress`, `completed`).
3. **Task**: Represents individual to-dos within a project. Tracks status (`todo`, `inProgress`, `done`) and `priority`.
4. **ProjectFile**: Handles file attachments related to specific projects, tracking the uploader.
5. **Activity**: An audit log that tracks user actions (e.g., "Project Created", "Task Completed") for transparency.
6. **Comment**: Allows users to communicate directly on specific projects.
7. **Invoice**: Handles billing details linked to specific projects and clients. Tracks status (`pending`, `paid`, `overdue`).

---

## 🔒 Security & Roles

ClientFlow utilizes a robust Role-Based Access Control (RBAC) system defined at the database level:
- **Admin**: Full access to all projects, user management, global reports, and system settings.
- **Developer**: Access to assigned projects, ability to manage tasks, and communicate with clients.
- **Client**: Restricted view limited to their specific projects, invoices, and communication threads.

---

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/kenenisabeyan/clientflow.git
cd clientflow
cd server
npm install

# Set up your environment variables
# Create a .env file and add:
# DATABASE_URL="postgresql://user:password@localhost:5432/clientflow"
# JWT_SECRET="your_super_secret_jwt_key"

# Sync the database schema
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
cd client
npm install

# Start the Vite development server
npm run dev
cd client
npm install

# Start the Vite development server
npm run dev
