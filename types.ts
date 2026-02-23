
export enum AppStep {
  SCREEN_1 = 1,
  SCREEN_2 = 2,
  SCREEN_3 = 3,
  SCREEN_4 = 4,
  SCREEN_5 = 5,
  SCREEN_6 = 6,
  SCREEN_7 = 7,
  SCREEN_8 = 8,
  SCREEN_9 = 9,
  SCREEN_10 = 10,
  SCREEN_11 = 11,
  SCREEN_12 = 12,
  SCREEN_12_1 = 13, // Detailed Analysis Screen
  SCREEN_12_2 = 14, // Date Filter Screen
  SCREEN_13 = 15,   // Cards & Transfers Screen
  SCREEN_14 = 16,   // Profile & Settings
}

export type Language = 'es' | 'en' | 'pt';
export type Currency = 'USD' | 'EUR' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'BRL' | 'GBP';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

export interface Section {
  id: string;
  title: string;
  percent: string;
  color: string;
  items: CategoryItem[];
}

export interface DebtItem {
  id: number;
  name: string;
  subtitle: string;
  initial: string;
  current: string;
  minPay: string;
  icon: string;
  paymentDay?: number; // Day of the month (1-31) for reminders
}

export interface PaymentMethod {
  id: number;
  name: string;
  subtitle: string;
  balance: string;
  type: 'cash' | 'debit' | 'credit';
  label: string;
  isReadOnly?: boolean; // New property to prevent editing
}

export interface BudgetSection {
  id: string;
  title: string;
  percentage: number;
  color: string;
  items: CategoryItem[];
  type: 'needs' | 'savings' | 'wants';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface InternalTransfer {
  id: string;
  fromId: number;
  toId: number;
  fromName: string;
  toName: string;
  amount: number;
  date: Date;
  commission: number;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  date: Date;
  methodName: string;
  categoryName?: string; // For expenses
  debtName?: string;     // For debt payments
  description?: string;  // Optional description
  isDebtPayment?: boolean;
  isWeekStart?: boolean; // For income
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}