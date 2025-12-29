import apiClient from './client';
import { getAuthHeaders } from './auth-token';

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  createdAt: string;
  userId: string;
  userName: string;
}

export enum ExpenseCategory {
  RENT = 'RENT',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  UTILITIES = 'UTILITIES',
  ENTERTAINMENT = 'ENTERTAINMENT',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
}

export interface ExpensePageResponse {
  content: Expense[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

class ExpensesAPI {
  async getAllExpenses(page = 0, size = 20): Promise<ExpensePageResponse> {
    const response = await apiClient.get(`/api/expenses?page=${page}&size=${size}`);
    return response.data;
  }

  async getExpense(id: number): Promise<Expense> {
    const response = await apiClient.get(`/api/expenses/${id}`);
    return response.data;
  }

  async createExpense(request: CreateExpenseRequest): Promise<Expense> {
    const response = await apiClient.post('/api/expenses', request);
    return response.data;
  }

  async updateExpense(id: number, request: CreateExpenseRequest): Promise<Expense> {
    const response = await apiClient.put(`/api/expenses/${id}`, request);
    return response.data;
  }

  async deleteExpense(id: number): Promise<void> {
    await apiClient.delete(`/api/expenses/${id}`);
  }

  async searchExpenses(query: string, page = 0, size = 20): Promise<ExpensePageResponse> {
    const response = await apiClient.get(`/api/expenses/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    return response.data;
  }

  async getExpensesByCategory(category: ExpenseCategory, page = 0, size = 20): Promise<ExpensePageResponse> {
    const response = await apiClient.get(`/api/expenses/category/${category}?page=${page}&size=${size}`);
    return response.data;
  }

  async getExpensesByDateRange(startDate: string, endDate: string, page = 0, size = 20): Promise<ExpensePageResponse> {
    const response = await apiClient.get(
      `/api/expenses/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&page=${page}&size=${size}`
    );
    return response.data;
  }
}

export const expensesAPI = new ExpensesAPI();


