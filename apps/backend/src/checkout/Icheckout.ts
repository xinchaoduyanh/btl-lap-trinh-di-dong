export interface WorkSession {
    checkIn: string
    checkOut: string
    hoursWorked: string
  }
  export interface DailyWorkRecord {
    date: string
    sessions: WorkSession[]
    totalHoursWorked: string
  }