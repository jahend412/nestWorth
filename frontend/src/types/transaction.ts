export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export interface CreateTransactionData {
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
  date: string;
}

export interface UpdateTransactionData {
  amount?: number;
  description?: string;
  category?: string;
  type?: "income" | "expense";
  date?: string;
}
