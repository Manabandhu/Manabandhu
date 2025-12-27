import apiClient from './client';

export interface SplitGroup {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  createdAt: string;
}

export interface SplitExpense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  expenseDate: string;
  createdAt: string;
}

export interface UserBalance {
  user: string;
  balance: number;
  status: 'owes' | 'owed';
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  memberEmails: string[];
}

export interface CreateExpenseRequest {
  description: string;
  amount: number;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  splits?: ExpenseSplitRequest[];
}

export interface ExpenseSplitRequest {
  userEmail: string;
  amount: number;
}

export interface ExpensePageResponse {
  content: SplitExpense[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

class SplitlyAPI {
  async createGroup(request: CreateGroupRequest): Promise<SplitGroup> {
    const response = await apiClient.post('/api/splitly/groups', request);
    return response.data;
  }

  async getUserGroups(): Promise<SplitGroup[]> {
    const response = await apiClient.get('/api/splitly/groups');
    return response.data;
  }

  async getGroup(groupId: number): Promise<SplitGroup> {
    const response = await apiClient.get(`/api/splitly/groups/${groupId}`);
    return response.data;
  }

  async addExpense(groupId: number, request: CreateExpenseRequest): Promise<SplitExpense> {
    const response = await apiClient.post(`/api/splitly/groups/${groupId}/expenses`, request);
    return response.data;
  }

  async getGroupExpenses(groupId: number, page = 0, size = 20): Promise<ExpensePageResponse> {
    const response = await apiClient.get(`/api/splitly/groups/${groupId}/expenses?page=${page}&size=${size}`);
    return response.data;
  }

  async getGroupBalances(groupId: number): Promise<UserBalance[]> {
    const response = await apiClient.get(`/api/splitly/groups/${groupId}/balances`);
    return response.data;
  }

  async settleExpense(expenseId: number): Promise<void> {
    await apiClient.post(`/api/splitly/expenses/${expenseId}/settle`);
  }
}

export const splitlyAPI = new SplitlyAPI();

