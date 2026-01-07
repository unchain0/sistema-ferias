export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  userId: string;
  name: string;
  clientManager: string;
  monthlyRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface VacationPeriod {
  id: string;
  professionalId: string;
  userId: string;
  acquisitionStartDate: string;
  acquisitionEndDate: string;
  usageStartDate: string;
  usageEndDate: string;
  totalDays: number;
  revenueDeduction: number;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: 'upcoming_vacation' | 'expiring_period';
  professionalName: string;
  date: string; // The relevant date (start date or expiration date)
  daysRemaining: number;
  details: string; // "Start in X days" or "Expires in Y days"
}

export interface DashboardData {
  totalProfessionals: number;
  totalVacationDays: number;
  totalRevenueImpact: number;
  vacationsByMonth: {
    month: string;
    count: number;
    impact: number;
  }[];
  professionalImpacts: {
    professionalName: string;
    totalDays: number;
    revenueImpact: number;
  }[];
  alerts: Alert[];
}
