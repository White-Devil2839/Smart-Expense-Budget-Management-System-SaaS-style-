# 💰 Smart Expense & Budget Management System (SEBMS)

A full-stack SaaS-style web application for tracking expenses, setting category-wise budgets, and viewing spending summaries — with role-based access control.

Built as a university-level Software Engineering project demonstrating **layered architecture**, **OOP/SOLID principles**, and **clean code practices**.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Axios, React Router |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Architecture** | Layered — Controller → Service → Repository |

---

## 📁 Project Structure

```
├── src/                        # Backend
│   ├── config/db.ts            # MongoDB connection
│   ├── models/                 # Mongoose schemas (User, Expense, Budget, Category)
│   ├── repositories/           # Data access layer
│   ├── services/               # Business logic layer
│   ├── controllers/            # HTTP request handlers
│   ├── routes/                 # Express route definitions
│   ├── middleware/auth.ts      # JWT auth + role guard middleware
│   ├── utils/jwt.ts            # Token generate/verify helpers
│   ├── types/                  # DTOs and custom types
│   └── index.ts                # Express app entry point
│
├── frontend/                   # Frontend
│   └── src/
│       ├── components/         # Layout, Navbar, Sidebar, ProtectedRoute
│       ├── pages/              # Login, Register, Dashboard, Expenses, Budgets, Categories
│       ├── context/            # AuthContext (JWT + role state)
│       ├── services/api.ts     # Axios instance with JWT interceptors
│       ├── index.css           # Global styles
│       └── App.tsx             # Router + route guards
│
├── docs/                       # Design documents
│   (idea.md, useCaseDiagram.md, sequenceDiagram.md, classDiagram.md, ErDiagram.md)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on port `27017`

### 1. Clone the repository

```bash
git clone https://github.com/White-Devil2839/Smart-Expense-Budget-Management-System-SaaS-style-.git
cd Smart-Expense-Budget-Management-System-SaaS-style-
```

### 2. Setup Backend

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

# Start backend server
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔐 Authentication & Roles

| Role | Capabilities |
|------|-------------|
| **USER** | Register, login, manage own expenses, set budgets, view dashboard |
| **ADMIN** | All USER capabilities + manage global categories, view all users |

- JWT token issued at login, stored in `localStorage`
- Automatically attached to every API call via Axios interceptor
- Auto-logout on token expiry (401 response)

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/auth/users` | Admin | List all users |

### Expenses
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/expenses` | User | List own expenses |
| POST | `/api/expenses` | User | Add expense (returns budget warning if exceeded) |
| PUT | `/api/expenses/:id` | User | Update own expense |
| DELETE | `/api/expenses/:id` | User | Delete own expense |

### Budgets
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/budgets?month=YYYY-MM` | User | List own budgets |
| POST | `/api/budgets` | User | Set a budget |

### Categories
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/categories` | User | List all categories |
| POST | `/api/categories` | Admin | Create category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

---

## ⚙️ Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Budget warning is advisory** | Expense is always saved; user gets a warning if budget is exceeded but is not blocked |
| **Unique constraint** `(userId, categoryId, month)` on budgets | Prevents duplicate budget entries |
| **Categories are admin-managed** | Users select from global categories; cannot create their own |
| **Layered architecture** | Separation of concerns — controllers handle HTTP, services handle logic, repositories handle data |
| **Interface + Implementation pattern** | Services follow the Dependency Inversion principle |

---

## 🏗️ Architecture

```
Client (React SPA)
     │
     ▼  HTTP / JSON
Controller Layer      ← Route handling, input validation, HTTP responses
     │
     ▼
Service Layer         ← Business logic, budget checks, authorization
     │
     ▼
Repository Layer      ← Data access via Mongoose
     │
     ▼
MongoDB Database      ← Persistent storage
```

---

## 📊 Design Documents

| Document | Description |
|----------|-------------|
| [idea.md](./idea.md) | Problem statement, scope, tech stack |
| [useCaseDiagram.md](./useCaseDiagram.md) | Use case diagram (Mermaid) |
| [sequenceDiagram.md](./sequenceDiagram.md) | Add Expense flow (Mermaid) |
| [classDiagram.md](./classDiagram.md) | Class diagram with all layers (Mermaid) |
| [ErDiagram.md](./ErDiagram.md) | Database schema (Mermaid ER diagram) |

---

## 📝 Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/sebms_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 👤 Author

**Divyansh Choudhary**

---

## 📄 License

This project is for academic/educational purposes.
