// Add this at the top of the file, after the imports
export interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }
export interface AttendanceSession {
  checkIn: string
  checkOut: string | null
}

export interface EmployeeStatus {
  status: "CHECKED_IN" | "CHECKED_OUT" | null
  session: {
    id: string
    employeeId: string
    checkIn: string
    checkOut: string | null
    status: string
    createdAt: string
    updatedAt: string
  } | null
  total_time: string | null
}