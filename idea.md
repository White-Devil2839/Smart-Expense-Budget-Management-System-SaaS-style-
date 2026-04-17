# Smart Expense & Budget Management System (SEBMS)

## Problem Statement

Individuals struggle to track daily expenses and maintain monthly budgets using manual methods. There is a need for a centralized web application where users can **log expenses**, **set category-wise budgets**, and **view spending summaries** — while administrators manage global categories and oversee users.

---

## Project Scope

### In Scope

- User registration and login (JWT-based authentication)
- Role-based access control (`USER`, `ADMIN`)
- CRUD operations on expenses
- Monthly budget setting per category
- Budget vs. actual spending summary
- Admin management of categories and user listing

### Out of Scope

- Payment gateway / billing
- Multi-currency support
- Real-time notifications
- File uploads (receipts)
- Mobile application

---

## Backend Architecture (75% Focus)

The system follows a **Layered Architecture**:

```
Client (React)
     │
     ▼
Controller Layer      ← Handles HTTP requests & responses
     │
     ▼
Service Layer         ← Business logic & authorization
     │
     ▼
Repository Layer      ← Data access via JPA
     │
     ▼
PostgreSQL Database   ← Persistent storage
```

### OOP & SOLID Principles

| Principle | How It's Applied |
|-----------|-----------------|
| **Single Responsibility** | Each layer handles only its own concern |
| **Open/Closed** | Services can be extended without modifying existing code |
| **Liskov Substitution** | Service implementations are interchangeable behind interfaces |
| **Interface Segregation** | Separate service interfaces per domain (Expense, Budget, etc.) |
| **Dependency Inversion** | Controllers depend on service interfaces, not implementations |
| **Encapsulation** | Entity internals are hidden; DTOs are used for API communication |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Axios |
| Backend | Node.js, Express.js |
| Language | TypeScript (strict mode) |
| ODM | Mongoose |
| Database | MongoDB |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Runtime | ts-node-dev (dev), Node.js (prod) |
| API Style | RESTful JSON |
| Version Control | Git + GitHub |

---

## Core Entities

| Entity | Purpose |
|--------|---------|
| `User` | Registered user with role and credentials |
| `Expense` | A spending entry linked to a user and category |
| `Budget` | Monthly spending limit per category per user |
| `Category` | Global spending categories managed by Admin |

---

## API Endpoints Overview

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/expenses` | User | List own expenses |
| POST | `/api/expenses` | User | Add expense |
| PUT | `/api/expenses/{id}` | User | Update expense |
| DELETE | `/api/expenses/{id}` | User | Delete expense |
| GET | `/api/budgets` | User | List own budgets |
| POST | `/api/budgets` | User | Set a budget |
| GET | `/api/categories` | User | List categories |
| POST | `/api/categories` | Admin | Add category |
| PUT | `/api/categories/{id}` | Admin | Update category |
| DELETE | `/api/categories/{id}` | Admin | Delete category |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/dashboard/summary` | User | Spending summary |
