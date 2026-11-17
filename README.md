# ClientFlow 🚀

[![ClientFlow CI](https://github.com/kenenisabeyan/clientflow/actions/workflows/ci.yml/badge.svg)](https://github.com/kenenisabeyan/clientflow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

**ClientFlow** is an enterprise-ready, full-stack client portal and project management platform designed to streamline interactions between agencies, freelancers, and clients. It provides a unified dashboard for managing projects, tracking Kanban tasks, billing & invoices, real-time activity feeds, and client communications.

---

## 🏗️ Architecture & System Design

```mermaid
flowchart LR
    subgraph Client ["Frontend (React 19 + Vite)"]
        UI["UI Layer\n(Lucide Icons + Recharts)"]
        Router["React Router DOM"]
        AuthCtx["Auth & Theme Context"]
        AxiosClient["Axios API Client"]
        UI --> Router --> AuthCtx --> AxiosClient
    end

    subgraph Server ["Backend (Node.js + Express 5)"]
        APIRouter["API Router (/api)"]
        AuthMW["JWT & RBAC Middleware"]
        Controllers["Controllers\n(Projects, Tasks, Invoices, Users)"]
        MongooseODM["Mongoose ODM"]
        APIRouter --> AuthMW --> Controllers --> MongooseODM
    end

    subgraph Data ["Persistence Layer"]
        Atlas[("MongoDB Atlas Cloud Cluster")]
    end

    AxiosClient -->|"HTTPS / REST API"| APIRouter
    MongooseODM -->|"Mongoose Queries"| Atlas
```

---

## 🏛️ 1. Deep Role Architecture & Relationships

```mermaid
graph TD
    subgraph Agency ["ClientFlow Agency Platform"]
        Admin["👑 Administrator (Kenenisa)"]
        Atlas[("🍃 MongoDB Atlas")]
    end

    subgraph Operations ["Client Portfolios & Billing"]
        Client["💼 Client (Delelegn)"]
        Projects["📁 Projects & Contracts"]
        Invoices["💳 Invoices & Payments"]
    end

    subgraph Engineering ["Engineering & Sprints"]
        Dev["⚡ Developer (Kidane)"]
        Tasks["✅ Sprint Tasks & Kanban"]
        Channels["💬 Channels (#general, #client-support, #dev-team)"]
    end

    Admin -->|"Assigns & Oversees"| Projects
    Admin -->|"Issues Invoices"| Invoices
    Admin -->|"Dispatches & Prioritizes"| Tasks
    Admin -->|"Direct & Channel Chat"| Channels

    Client -->|"Views Scoped Deliverables"| Projects
    Client -->|"Reviews & Pays Online"| Invoices
    Client -->|"Reports & Requests via SLA"| Channels

    Dev -->|"Assigned To"| Projects
    Dev -->|"Advances Status (To Do → Done)"| Tasks
    Dev -->|"Collaborates in #dev-team"| Channels

    Projects <--> Atlas
    Invoices <--> Atlas
    Tasks <--> Atlas
    Channels <--> Atlas
```

### 🎭 Multi-Role Use Cases & Capabilities

#### 👑 1. Administrator (`admin` — e.g. `kenenisa@gmail.com`)
* **Operations Command Dashboard**: Real-time business overview with live MongoDB Atlas metrics (Total Clients, Active Projects, Open Tasks, Completion Velocity), 7-day milestone area charts, and task distribution donut charts.
* **Customer Relationship Management (`/clients`)**: Full CRUD with Client 360° Drawer, linked portfolios, phone/company attributes, pagination, search, and CSV export.
* **Portfolio Governance (`/projects`)**: Create and edit projects, assign both a contracting Client and a designated Developer, adjust progress sliders (0–100%), and filter by status.
* **Sprint Backlog (`/tasks`)**: Create tasks with project mapping, priority tags (`Low`, `Medium`, `High`), due dates, and developer assignments.
* **Billing Management (`/invoices`)**: Issue itemized statements with custom line items, rates, quantities, and due dates. Reconcile receivables (Total Billed, Paid, Pending, Overdue).
* **Agency-Wide Chat (`/messages`)**: Broadcast announcements in `#general`, monitor support tickets in `#client-support`, coordinate in `#dev-team`, and initiate 1:1 direct messages with any user.

#### 💼 2. Client (`client` — e.g. `delelegn@gmail.com`)
* **Client Portal Dashboard**: Displays personalized welcome, **My Contracted Projects**, **Delivered Milestones**, **Open Deliverables**, and **Pending Billing Balance**.
* **Project Transparency (`/projects`)**: Scoped exclusively to projects contracted by this client. Tracks progress bars and active development status.
* **Deliverables Review (`/tasks`)**: Views sprint tasks and technical milestones under their contracted projects.
* **Self-Service Invoicing & Payments (`/invoices`)**:
  * Views only their own invoices.
  * Itemized line-item breakdown drawer with subtotal, tax ($0), and grand total.
  * **"Pay Now"** button: Opens simulated 256-bit encrypted checkout. Clicking confirm hits `POST /api/invoices/:id/pay`, instantly updating the status to **Paid** in MongoDB Atlas.
* **Support Channel (`/messages`)**: Participates in `#general` and `#client-support`, with direct messaging to agency leadership.
* **Protected Scope**: Restricted from internal developer assignments, other clients' private data, and agency profit reports.

#### ⚡ 3. Developer (`developer` — e.g. `kidane@gmail.com`)
* **Sprint Station Dashboard**: Displays personalized greeting, **My Sprint Tasks**, **Tasks in Progress**, **Completed Sprint Work**, and **Sprint Velocity**.
* **Interactive Kanban & Table (`/tasks`)**:
  * **Kanban View**: 3 columns (**To Do**, **In Progress**, **Completed**) with 1-click status advancement buttons (**Start → In Progress → Done**).
  * **Table View**: Quick status dropdown selector (`todo`, `inProgress`, `done`) calling `PUT /api/tasks/:id/status`.
  * Filter by priority (`High`, `Medium`, `Low`), project, and search query.
  * Task 360° drawer with full specifications and acceptance criteria.
* **Assigned Engineering Projects (`/projects`)**: Views projects they are assigned to build.
* **Engineering Chat (`/messages`)**: Access to `#dev-team` and `#general` for technical coordination.
* **Protected Scope**: Restricted from financial invoicing data and client commercial contracts.

---

### 📡 End-to-End API Integration & RBAC Matrix

| Method | Endpoint | Description | Role Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | JWT Authentication returning user role & details | Public |
| `GET` | `/api/projects` | Scoped projects (all for Admin, client-owned for Client, assigned for Dev) | All Roles |
| `POST` | `/api/projects` | Create new client project with developer allocation | Admin |
| `GET` | `/api/tasks` | Scoped task queue with status grouping (`todo`, `inProgress`, `done`) | All Roles |
| `POST` | `/api/tasks` | Create sprint task mapped to project and developer | Admin / Dev |
| `PUT` | `/api/tasks/:id/status` | Instant 1-click status update (`todo` → `inProgress` → `done`) | Admin / Dev |
| `GET` | `/api/invoices` | Scoped billing statements (all for Admin, owned for Client) | Admin / Client |
| `POST` | `/api/invoices` | Generate new invoice with auto-generated ID & line items | Admin |
| `POST` | `/api/invoices/:id/pay` | Process online payment and mark invoice as **Paid** | Admin / Client |
| `GET` | `/api/messages` | Fetch messages by channel (`general`, `client-support`, `dev-team`) or direct recipient | All Roles |
| `POST` | `/api/messages` | Send message with real-time optimistic feed update | All Roles |
| `GET` | `/api/activity` | Enterprise audit trail scoped by role and associated projects | All Roles |
| `GET` | `/api/users` | Directory of team members and clients (password excluded) | All Roles |
| `POST` | `/api/users` | Create & invite new team member with assigned RBAC role | Admin |
| `PUT` | `/api/users/:id/role` | Instant 1-click RBAC role update (`admin`, `client`, `developer`) | Admin |
| `DELETE`| `/api/users/:id` | Remove user and invalidate session | Admin |

---

### 🎨 Non-Functional Architecture & UX Standards

* **Zero-Arrow Floating Scrollbar Engine**: Clunky native Windows scrollbar stepper arrows are completely suppressed globally via `::-webkit-scrollbar-button`. Replaced by an ultra-clean 8px floating rounded pill thumb with smooth indigo hover glow.
* **Invisible Sidebar Navigation Scroll**: The 260px fixed sidebar utilizes `scrollbar-width: none` and `display: none` on WebKit scrollbars to guarantee that no vertical scroll stick cuts into the sidebar border, while preserving smooth trackpad and mousewheel scrolling.
* **Floating Corner Scroll Sticker**: A reactive bottom-right floating pill sticker appears smoothly when scrolling past 150px, providing one-click animated smooth scroll back to the top of any page.
* **Fixed Topbar Omnisearch (`Ctrl+K` / `Cmd+K`)**: Universal search accessible from anywhere in the app with keyboard shortcuts, categorization by Projects, Tasks, Invoices, and Users, and instant navigation.
* **Optimistic UI & Data Portability**: Instant UI state transitions across Kanban cards, project status, and invoice payments with toast confirmation and 1-click CSV export on every table.

---

## 🛡️ 2. The 7 Non-Functional Architectural Pillars

ClientFlow is built around 7 core non-functional software engineering pillars designed for high-availability enterprise environments:

### 1. 🚀 Performance
* **Compound MongoDB Indexes**: High-frequency queries leverage B-Tree compound indexes on `{ client: 1, status: 1 }`, `{ project: 1, status: 1 }`, `{ user: 1, createdAt: -1 }`, ensuring sub-millisecond execution times.
* **Vendor Chunk Code-Splitting**: Vite configuration splits dependencies into isolated vendor bundles (`vendor-react`, `vendor-charts`, `vendor-icons`, `vendor-axios`), reducing the initial application bundle down to ~105 kB gzipped.
* **Debounced Omnisearch**: Universal live search queries are debounced by 250ms with `Promise.allSettled`, preventing backend saturation during rapid typing.

### 2. 🟢 Availability
* **Cloud Database Replica Sets**: Powered by a 3-node MongoDB Atlas replica set with automated primary failover and zero data loss.
* **Self-Healing Reconnection Loop**: If connection drops or transient network errors occur, the backend initiates a 5-second backoff loop to automatically reconnect.
* **Live Health Probing (`/api/health`)**: Exposes real-time uptime, database connectivity state, and cloud host metadata for automated monitoring.

### 3. ⚙️ Reliability
* **Process-Level Error Interceptors**: Global listeners for `unhandledRejection` and `uncaughtException` in `server.ts` prevent server crashes under unhandled promise conditions.
* **Cold-Start Resilience**: Axios client in `client/src/api/axios.ts` is configured with a 30-second timeout to smoothly absorb Render free-tier cold starts without failing user requests.
* **Graceful Degradation**: Dashboard, Kanban, and detail views use `Promise.allSettled` to display available datasets even if one sub-service is slow or unavailable.

### 4. 🔒 Security
* **Stateless JWT Verification**: Every protected route validates cryptographically signed JWT tokens with database user existence checks on each invocation.
* **Role-Based Access Control (RBAC)**: Enforced via Express middleware (`authorize('admin')`, `authorize('admin', 'client')`) preventing unauthorized resource inspection (e.g., developers strictly blocked from `/api/invoices` with HTTP 403 Forbidden).
* **Password Sanitization**: Passwords hashed with 10-round salted `bcryptjs` and stripped from all controller responses using Mongoose `.select('-password')`.

### 5. 🎨 Adaptability
* **Dynamic Theme Tokens**: Full-spectrum Light and Dark mode switching powered by CSS custom properties, applied instantly across surfaces, modals, text tokens, Recharts SVGs, and scrollbars.
* **Adaptive Multi-Role Layout**: Viewports and navigation links dynamically morph based on the authenticated actor (Admin, Client, Developer).

### 6. 🔄 Interoperability
* **Standard RESTful Contracts**: Consistent JSON payloads with standard HTTP response codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error).
* **1-Click CSV Report Exports**: Instant CSV data export on Dashboard, Projects, Tasks, Invoices, Team Management, and Activity Audit Log for seamless interoperability with Excel, Google Sheets, or corporate ERPs.

### 7. 📦 Portability
* **Fail-Safe API Resolution**: Axios automatically switches from relative `/api` on Vercel reverse-proxy to direct Render backend (`https://clientflow-j8qr.onrender.com/api`) when deployed to cloud environments.
* **Multi-Stage Docker Architecture**: Includes production-grade `Dockerfile.client` (Nginx Alpine) and `Dockerfile.server` (Node.js Alpine) ready to deploy on any Docker/Kubernetes container infrastructure.

---

## 📱 3. Universal Multi-Device & Mobile Responsive Architecture

The entire user interface was re-architected to deliver fluid, responsive layouts across ultra-compact smartphones (≤ 480px), tablets (768px – 1024px), laptops, and 4K displays:

### Horizontal Viewport Containment
* **Root Boundary Constraints**: `html`, `body`, `#root`, and `.app` enforce `width: 100% !important; max-width: 100vw !important; overflow-x: hidden !important;`, preventing off-screen horizontal expansion.
* **Fluid Grid Breakpoints**: Replaced fixed minima (`minmax(480px, 1fr)`) with adaptive CSS grid classes (`.dashboard-charts-grid`, `.dashboard-tables-grid`, `.dashboard-bottom-grid`, `.kanban-board-grid`, `.project-detail-grid`, `.reports-charts-grid`) that automatically stack to `1fr` on screens ≤ 768px.
* **Internal Table Touch-Scrolling**: All data tables are wrapped in `.table-responsive` with `-webkit-overflow-scrolling: touch !important`, keeping card containers strictly bounded to the phone screen while allowing data tables to scroll horizontally internally.
* **Non-Colliding Topbar Navigation**: Split into `.topbar-left` (`flex-shrink: 0; min-width: 0`) and `.topbar-right` (`flex-shrink: 1; min-width: 0`), ensuring the hamburger menu toggle and page title never collide or get pushed off-screen.
* **Adaptive Messaging Layout**: The messaging center (`.messages-layout-box`) smoothly transitions from a dual-column desktop view to a vertically stacked list-and-chat interface on mobile.

---

## 🌄 4. Scenic Authentication Architecture

The login and registration experiences feature a scenic, glassmorphic visual system:

* **Sunset/Dawn Landscape Vector Art**: Crisp SVG scenery with soft sunrise gradients (`#f472b6` → `#fed7aa` → `#fef08a`), distant mountain silhouettes, rolling hills (`#86efac`, `#10b981`, `#059669`), and geometric stepped pine conifers.
* **Top Header Branding**: Dynamic geometric origami emblem with uppercase typography and a floating **Enterprise Resource Planning • Bright Ideas (Illuminating Growth)** frosted badge with a glowing amber lightbulb.
* **Frosted Glassmorphism Card**: `backdrop-filter: blur(24px) saturate(190%)`, `background: rgba(255, 255, 255, 0.52)`, and a crisp 1.5px translucent border with smooth 28px rounded corners.
* **Action Form Controls**: Rounded white input containers, "Remember me" checkbox, "Forgot password?" link, and a teal-to-deep-blue gradient submit button (`linear-gradient(135deg, #0284c7 0%, #1e40af 100%)`).
* **Interactive Submission State**: Transitions seamlessly to an animated spinning ring with **"Signing In..."** text during authentication.
* **1-Click Live Credential Testing**: Embedded pills for instant testing of all 3 MongoDB Atlas roles (**Admin**, **Client**, **Developer**).

---

## ⚡ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript | Modern, high-performance SPA architecture |
| **Routing & UI** | React Router DOM v6, Lucide React, Recharts | Declarative navigation, accessible icons & analytics charts |
| **Styling** | Custom CSS Design System | Themeable design tokens, dark/light surface modes |
| **Backend** | Node.js, Express.js 5.x, TypeScript | Strongly typed, modular REST API |
| **Database & ODM** | Mongoose ODM, MongoDB Atlas Cloud Cluster | Replica sets, compound B-Tree indexing, self-healing reconnection |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs | Secure stateless authentication & Role-Based Access Control |
| **DevOps & Containers** | Docker, Docker Compose, Nginx | Multi-stage production container builds and local orchestration |
| **CI/CD** | GitHub Actions | Automated linting, type-checking, and build validation |

---

## 🗂️ Monorepo Structure

```
clientflow/
├── .github/
│   ├── workflows/ci.yml       # GitHub Actions CI pipeline
│   ├── ISSUE_TEMPLATE/        # Standardized bug report & feature request templates
│   └── PULL_REQUEST_TEMPLATE  # Pull request review checklist
├── client/                    # Frontend Single Page Application
│   ├── src/
│   │   ├── api/               # Axios API instance and endpoints
│   │   ├── components/        # Layout, modals, navigation components
│   │   ├── context/           # AuthContext & ThemeContext
│   │   ├── pages/             # Dashboard, Projects, Tasks, Invoices, Reports...
│   │   ├── App.tsx            # Application routing shell
│   │   └── main.tsx           # React DOM root mounting
│   ├── index.html             # HTML entry template
│   ├── vite.config.ts         # Vite bundler configuration & chunk optimization
│   └── tsconfig.json          # Frontend TypeScript configuration
├── server/                    # Backend REST API Server
│   ├── config/                # Database & environment configurations
│   ├── controllers/           # Business logic controllers
│   ├── middleware/            # JWT authentication, role guards, file upload
│   ├── models/                # Domain models
│   ├── prisma/                # Prisma database schema and migrations
│   ├── routes/                # Express API routes
│   ├── utils/                 # Validators and logging utilities
│   ├── server.ts              # Express application bootstrap
│   └── tsconfig.json          # Backend TypeScript configuration
├── docker-compose.yml         # Multi-container orchestration (DB + Server + Client)
├── Dockerfile.client          # Multi-stage production build for Frontend (Nginx)
├── Dockerfile.server          # Multi-stage production build for Backend
├── nginx.conf                 # Production Nginx reverse proxy configuration
├── .editorconfig              # Editor code styling rules
├── .prettierrc                # Code formatting configuration
├── CONTRIBUTING.md            # Contribution guidelines
├── SECURITY.md                # Vulnerability disclosure policy
├── LICENSE                    # MIT License
└── package.json               # Monorepo root workspace scripts
```

---

## 🚀 Quick Start

### Option A: Using Docker (Recommended)

Run the full platform (MongoDB database, Node.js API, and Nginx-powered React client) with a single command:

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5001/api](http://localhost:5001/api)
- **MongoDB:** `localhost:27017`

---

### Option B: Cloud Production Deployment (Live)

- **Frontend (Vercel):** [https://clientflow-nu-pied.vercel.app](https://clientflow-nu-pied.vercel.app)
- **Backend API (Render):** [https://clientflow-j8qr.onrender.com](https://clientflow-j8qr.onrender.com)
- **Database (MongoDB Atlas):** Dedicated cloud cluster with IP whitelisting & replication

#### 🔑 Demo Role Credentials:
| Role | Email | Password | Primary Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `kenenisa@gmail.com` | `123456` | Full platform control, billing, projects, global tasks |
| **Client** | `delelegn@gmail.com` | `12345678` | Scoped project portfolios, invoice payment, deliverables |
| **Developer** | `kidane@gmail.com` | `12345678` | Assigned sprints, Kanban board, task status advance |

---

### Option C: Local Development

#### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL or MongoDB running locally
- npm or pnpm

#### 2. Install All Dependencies
From the repository root:
```bash
npm run install:all
```

#### 3. Configure Environment Variables
Copy the template in `/server`:
```bash
cp server/.env.example server/.env
```
Update `DATABASE_URL` and `JWT_SECRET` inside `server/.env`.

#### 4. Run Development Servers
In separate terminals or using the root scripts:
```bash
# Start backend API (nodemon + ts-node)
npm run dev:server

# Start frontend development server (Vite HMR)
npm run dev:client
```

---

## 🛠️ Root Monorepo Commands

| Command | Action |
| :--- | :--- |
| `npm run install:all` | Installs dependencies for both `client` and `server` |
| `npm run dev:client` | Starts Vite client dev server at `localhost:5173` |
| `npm run dev:server` | Starts Express backend dev server at `localhost:5001` |
| `npm run typecheck` | Validates TypeScript types across both `client` and `server` |
| `npm run build` | Compiles both backend (`tsc`) and frontend (`vite build`) |

---

## 🔒 Security & Access Control

ClientFlow enforces **Role-Based Access Control (RBAC)** across all endpoints:

- **Admin**: Complete platform visibility, user management, billing, global analytics, and project approvals.
- **Developer**: Assigned project boards, task tracking (Kanban), code delivery, and client communication.
- **Client**: Restricted access restricted to assigned projects, invoice review, and direct support tickets.

---

## 🤝 Contributing & License

Contributions are always welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more details.
