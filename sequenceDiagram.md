# Sequence Diagram — Add Expense Flow

## Overview

This diagram traces the **Add Expense** request through the layered architecture:

**Client → JWT Filter → Controller → Service → Repository → Database**

---

## Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Client)
    participant Filter as JwtAuthFilter
    participant Controller as ExpenseController
    participant Service as ExpenseService
    participant BudgetSvc as BudgetService
    participant Repo as ExpenseRepository
    participant DB as PostgreSQL

    User->>Filter: POST /api/expenses (JWT in header)
    Filter->>Filter: Validate JWT token

    alt Invalid Token
        Filter-->>User: 401 Unauthorized
    end

    Filter->>Controller: Authenticated request (userId extracted)
    Controller->>Controller: Validate request body
    
    alt Validation Fails
        Controller-->>User: 400 Bad Request
    end

    Controller->>Service: createExpense(userId, expenseDTO)
    Service->>Repo: findCategoryById(categoryId)
    Repo->>DB: SELECT FROM categories
    DB-->>Repo: Category
    
    alt Category Not Found
        Service-->>Controller: 404 Not Found
        Controller-->>User: 404 Category Not Found
    end

    Service->>BudgetSvc: checkBudget(userId, categoryId, month)
    BudgetSvc->>DB: SELECT FROM budgets
    DB-->>BudgetSvc: Budget record

    Note over BudgetSvc: If budget exceeded → attach warning (advisory only, expense is still saved)

    Service->>Repo: save(expenseEntity)
    Repo->>DB: INSERT INTO expenses
    DB-->>Repo: Saved expense
    Repo-->>Service: Expense entity

    Service->>BudgetSvc: updateSpentAmount(amount)
    BudgetSvc->>DB: UPDATE budgets SET spent_amount
    DB-->>BudgetSvc: Updated

    Service-->>Controller: ExpenseResponseDTO
    Controller-->>User: 201 Created (expense + budgetWarning if any)
```

---

## Flow Summary

| Step | Layer | Action |
|------|-------|--------|
| 1–2 | Filter | Validate JWT token from Authorization header |
| 3–4 | Controller | Validate request body (amount, categoryId, date) |
| 5–7 | Service | Verify that the category exists |
| 8–9 | Service | Check if adding this expense exceeds the monthly budget |
| 10–12 | Repository | Persist the expense to the database |
| 13–14 | Service | Update the spent amount on the matching budget record |
| 15–16 | Controller | Return 201 Created with expense data |

---

## Design Notes

- **Budget warning is advisory** — the expense is saved regardless of budget status
- **JWT is stateless** — validated on every request via the filter, no server-side sessions
- **DTO pattern** — input (`ExpenseDTO`) and output (`ExpenseResponseDTO`) are separate from the `Expense` entity
