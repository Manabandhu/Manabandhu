export { default as apiClient } from './client';
export * from './users';
export * from './auth';
export * from './onboarding';
export * from './notifications';

export {
  expensesAPI,
  ExpenseCategory,
} from './expenses';
export type {
  Expense,
  CreateExpenseRequest as CreatePersonalExpenseRequest,
  ExpensePageResponse as PersonalExpensePageResponse,
} from './expenses';

export { splitlyAPI } from './splitly';
export type {
  SplitGroup,
  SplitExpense,
  UserBalance,
  CreateGroupRequest,
  CreateExpenseRequest as CreateSplitExpenseRequest,
  ExpenseSplitRequest,
  ExpensePageResponse as SplitExpensePageResponse,
} from './splitly';
