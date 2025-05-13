// Add this at the top of the file, after the imports
export interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }
  export interface Employee {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }

  export interface CheckoutSession {
    id: string;
    employeeId: string;
    checkIn: string;
    checkOut: string | null;
    status: 'CHECKED_IN' | 'CHECKED_OUT';
    createdAt: string;
    updatedAt: string;
    employee: Employee;
  }

  export interface CheckoutStatus {
    status: 'CHECKED_IN' | 'CHECKED_OUT';
    session: {
      checkIn: string;
    };
    total_time: string;
  }

  export interface CheckoutError {
    message: string;
    error: string;
    statusCode: number;
  }
