export interface Employee {
  id: string;
  sequenceNumber: number;
  code?: string;
  jobTitle?: string;
  name: string;
  branch: string;
  hireDate: string;
  lastVacationReturnDate: string;
  calculationDate: string;
  basicSalary: number;
  housingAllowance: number;
  transferAllowance: number;
  phoneAllowance: number;
  foodAllowance: number;
  fixedAllowances: number;
  ticketPrice: number;
  paidEndOfService: number;
  socialSecurity: number;
  includeSocialSecurity?: boolean;
  loans: number;
  absence: number;
  withdrawals: number;
  notes: string;
  isActive?: boolean;
}

export interface CalculatedEmployee extends Employee {
  totalSalary: number;
  totalWorkDurationYears: number;
  durationSinceLastVacationYears: number;
  vacationDaysEntitlement?: number;
  earnedVacationDays?: number;
  vacationAllowance: number;
  ticketAllowance: number;
  endOfServiceAllowance: number;
  dueEndOfService: number;
}

export interface ArchivedRecord {
  id: string;
  type: 'endOfService' | 'vacationAllowance' | 'vacationRequest' | 'loanRequest';
  title: string;
  employeeName: string;
  date: string;
  data: any;
}

