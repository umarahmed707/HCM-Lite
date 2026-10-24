export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface User {
  userId: string;
  email: string;
  role: Role;
  employeeId?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';
  source: 'web' | 'camera';
}

export interface LeaveRequest {
  id: string;
  type: 'ANNUAL' | 'SICK' | 'CASUAL' | 'UNPAID';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}