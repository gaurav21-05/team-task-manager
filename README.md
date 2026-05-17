# 🚀 TaskFlow — Team Task Manager

A production-ready, full-stack team task management application with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Validation | Zod + React Hook Form |
| Notifications | react-hot-toast |
| Deployment | Railway |

## Features

- **Authentication** — Signup, Login, Logout with JWT cookies
- **Role-Based Access** — Admin (full control) & Member (task updates only)
- **Project Management** — CRUD operations with team members
- **Task Management** — Create, assign, track status (Pending/In Progress/Completed)
- **Overdue Detection** — Automatic overdue flagging for past-due incomplete tasks
- **Dashboard** — Stats cards, task breakdown, recent activity feed
- **Dark Mode** — Full dark/light theme support
- **Responsive** — Mobile-first design with sidebar + mobile nav

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd team-task-manager
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL and JWT secret:

```
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
JWT_SECRET="your-secret-key"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Or create migration (production)
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. First Steps

1. Visit `/signup` to create an **Admin** account
2. Create your first project
3. Add team members by their email
4. Create and assign tasks

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/logout` | No | Logout user |
| GET | `/api/auth/me` | Yes | Get current user |

### Projects
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/projects` | Yes | Any | List projects |
| POST | `/api/projects` | Yes | Admin | Create project |
| GET | `/api/projects/:id` | Yes | Any | Get project details |
| PUT | `/api/projects/:id` | Yes | Admin | Update project |
| DELETE | `/api/projects/:id` | Yes | Admin | Delete project |

### Team Members
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/projects/:id/members` | Yes | Admin | Add member |
| GET | `/api/projects/:id/members` | Yes | Any | List members |
| DELETE | `/api/projects/:id/members/:memberId` | Yes | Admin | Remove member |

### Tasks
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/tasks` | Yes | Any | List tasks (filtered) |
| POST | `/api/tasks` | Yes | Admin | Create task |
| PUT | `/api/tasks/:id` | Yes | Any* | Update task |
| DELETE | `/api/tasks/:id` | Yes | Admin | Delete task |

*Members can only update status of tasks assigned to them.

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard` | Yes | Get dashboard stats |

## Deployment on Railway

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init
```

### 2. Add PostgreSQL

- Go to Railway dashboard
- Click **+ New** → **Database** → **PostgreSQL**
- Railway auto-sets `DATABASE_URL`

### 3. Set Environment Variables

In Railway dashboard → Variables:
```
JWT_SECRET=your-production-secret
DATABASE_URL=(auto-set by Railway)
```

### 4. Deploy

```bash
railway up
```

Or connect your GitHub repo for automatic deployments.

### 5. Run Migrations

```bash
railway run npx prisma migrate deploy
```

## Project Structure

```
src/
├── app/
│   ├── api/          # 13 API route files
│   ├── (auth)/       # Login & Signup pages
│   └── (dashboard)/  # Protected pages with sidebar
├── components/
│   ├── ui/           # Reusable primitives
│   ├── layout/       # Sidebar, MobileNav
│   ├── forms/        # Form components
│   ├── dashboard/    # Stats & Activity
│   └── ...
├── context/          # Auth, Theme providers
├── lib/              # Prisma, Auth, Validations
└── types/            # TypeScript types
```

## License

MIT
