import type { Employee, Table, MenuItem, Order, Shift, Attendance, Notification, Checkout } from "@/types/schema"

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.ithotpot.com"

// Helper function for API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      // You can add authentication headers here
      // "Authorization": `Bearer ${getToken()}`
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API request failed with status ${response.status}`)
  }

  return await response.json()
}

// Employee API functions
export const employeeAPI = {
  getAll: () => fetchAPI<Employee[]>("/employees"),
  getById: (id: string) => fetchAPI<Employee>(`/employees/${id}`),
  create: (data: Partial<Employee>) => fetchAPI<Employee>("/employees", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Employee>) =>
    fetchAPI<Employee>(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/employees/${id}`, { method: "DELETE" }),
}

// Table API functions
export const tableAPI = {
  getAll: () => fetchAPI<Table[]>("/tables"),
  getById: (id: string) => fetchAPI<Table>(`/tables/${id}`),
  create: (data: Partial<Table>) => fetchAPI<Table>("/tables", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Table>) =>
    fetchAPI<Table>(`/tables/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/tables/${id}`, { method: "DELETE" }),
}

// MenuItem API functions
export const menuItemAPI = {
  getAll: () => fetchAPI<MenuItem[]>("/menu-items"),
  getById: (id: string) => fetchAPI<MenuItem>(`/menu-items/${id}`),
  create: (data: Partial<MenuItem>) =>
    fetchAPI<MenuItem>("/menu-items", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<MenuItem>) =>
    fetchAPI<MenuItem>(`/menu-items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/menu-items/${id}`, { method: "DELETE" }),
}

// Order API functions
export const orderAPI = {
  getAll: () => fetchAPI<Order[]>("/orders"),
  getById: (id: string) => fetchAPI<Order>(`/orders/${id}`),
  create: (data: Partial<Order>) => fetchAPI<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Order>) =>
    fetchAPI<Order>(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/orders/${id}`, { method: "DELETE" }),
  updateStatus: (id: string, status: string) =>
    fetchAPI<Order>(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
}

// Shift API functions
export const shiftAPI = {
  getAll: () => fetchAPI<Shift[]>("/shifts"),
  getById: (id: string) => fetchAPI<Shift>(`/shifts/${id}`),
  create: (data: Partial<Shift>) => fetchAPI<Shift>("/shifts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Shift>) =>
    fetchAPI<Shift>(`/shifts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/shifts/${id}`, { method: "DELETE" }),
}

// Attendance API functions
export const attendanceAPI = {
  getAll: () => fetchAPI<Attendance[]>("/attendances"),
  getById: (id: string) => fetchAPI<Attendance>(`/attendances/${id}`),
  create: (data: Partial<Attendance>) =>
    fetchAPI<Attendance>("/attendances", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Attendance>) =>
    fetchAPI<Attendance>(`/attendances/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/attendances/${id}`, { method: "DELETE" }),
}

// Notification API functions
export const notificationAPI = {
  getAll: () => fetchAPI<Notification[]>("/notifications"),
  getById: (id: string) => fetchAPI<Notification>(`/notifications/${id}`),
  create: (data: Partial<Notification>) =>
    fetchAPI<Notification>("/notifications", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Notification>) =>
    fetchAPI<Notification>(`/notifications/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/notifications/${id}`, { method: "DELETE" }),
  markAsRead: (id: string) => fetchAPI<Notification>(`/notifications/${id}/read`, { method: "PUT" }),
  markAllAsRead: () => fetchAPI<void>("/notifications/read-all", { method: "PUT" }),
}

// Checkout API functions
export const checkoutAPI = {
  getAll: () => fetchAPI<Checkout[]>("/checkouts"),
  getById: (id: string) => fetchAPI<Checkout>(`/checkouts/${id}`),
  create: (data: Partial<Checkout>) => fetchAPI<Checkout>("/checkouts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Checkout>) =>
    fetchAPI<Checkout>(`/checkouts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/checkouts/${id}`, { method: "DELETE" }),
  getActive: () => fetchAPI<Checkout[]>("/checkouts/active"),
}

// Analytics API functions
export const analyticsAPI = {
  getDailySales: (startDate?: string, endDate?: string) =>
    fetchAPI<{ date: string; total: number }[]>(
      `/analytics/daily-sales?startDate=${startDate || ""}&endDate=${endDate || ""}`,
    ),
  getTopSellingItems: (limit?: number) =>
    fetchAPI<{ name: string; quantity: number; revenue: number }[]>(`/analytics/top-items?limit=${limit || 5}`),
  getTableOccupancy: () => fetchAPI<{ status: string; count: number }[]>("/analytics/table-occupancy"),
  getEmployeePerformance: () =>
    fetchAPI<{ name: string; ordersHandled: number; revenue: number }[]>("/analytics/employee-performance"),
  getRevenueByCategory: () => fetchAPI<{ category: string; revenue: number }[]>("/analytics/revenue-by-category"),
}

// Authentication API functions
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ token: string; user: Employee }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => fetchAPI<void>("/auth/logout", { method: "POST" }),
  getCurrentUser: () => fetchAPI<Employee>("/auth/me"),
}
