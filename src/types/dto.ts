// ── Request DTOs ────────────────────────────────────────

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

export interface ExpenseDTO {
  amount: number;
  categoryId: string;
  date: string;       // ISO date string
  description?: string;
}

export interface BudgetDTO {
  categoryId: string;
  limitAmount: number;
  month: string;      // "YYYY-MM"
}

// ── Response DTOs ───────────────────────────────────────

export interface AuthResponseDTO {
  accessToken: string;
  role: string;
}

export interface ExpenseResponseDTO {
  id: string;
  amount: number;
  categoryName: string;
  date: string;
  description?: string;
  budgetWarning?: string;
}
