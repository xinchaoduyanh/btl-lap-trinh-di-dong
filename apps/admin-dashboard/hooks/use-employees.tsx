"use client"

import { useState, useEffect, useCallback } from "react"
import { type Employee, Role, type CreateEmployeeRequest, type UpdateEmployeeRequest } from "@/types/schema"

// Mock data for development - will be replaced with API calls in production
const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: Role.MANAGER,
    isActive: true,
    createdAt: "2023-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: Role.WAITER,
    isActive: true,
    createdAt: "2023-02-20T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: Role.CASHIER,
    isActive: true,
    createdAt: "2023-03-10T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: Role.WAITER,
    isActive: false,
    createdAt: "2023-04-05T00:00:00.000Z",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david@example.com",
    role: Role.CASHIER,
    isActive: true,
    createdAt: "2023-05-12T00:00:00.000Z",
  },
  {
    id: "6",
    name: "Emily Davis",
    email: "emily@example.com",
    role: Role.WAITER,
    isActive: true,
    createdAt: "2023-06-18T00:00:00.000Z",
  },
  {
    id: "7",
    name: "Robert Wilson",
    email: "robert@example.com",
    role: Role.ADMIN,
    isActive: true,
    createdAt: "2023-07-22T00:00:00.000Z",
  },
]

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all employees
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In production, use the API client
      // const data = await employeeAPI.getAll()
      // setEmployees(data)

      // Using mock data for development
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setEmployees(mockEmployees)
    } catch (err) {
      setError("Failed to fetch employees")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single employee by ID
  const getEmployee = useCallback(async (id: string) => {
    try {
      // In production, use the API client
      // return await employeeAPI.getById(id)

      // Using mock data for development
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const employee = mockEmployees.find((emp) => emp.id === id)
      if (!employee) throw new Error("Employee not found")
      return employee
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new employee
  const createEmployee = useCallback(async (employeeData: CreateEmployeeRequest) => {
    try {
      // In production, use the API client
      // return await employeeAPI.create(employeeData)

      // Using mock data for development
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const newEmployee: Employee = {
        ...employeeData,
        id: Date.now().toString(),
        isActive: employeeData.isActive ?? true,
        createdAt: new Date().toISOString(),
      }
      setEmployees((prev) => [...prev, newEmployee])
      return newEmployee
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing employee
  const updateEmployee = useCallback(async (id: string, employeeData: UpdateEmployeeRequest) => {
    try {
      // In production, use the API client
      // return await employeeAPI.update(id, employeeData)

      // Using mock data for development
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...employeeData } : emp)))
      return { id, ...employeeData }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete an employee
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      // In production, use the API client
      // await employeeAPI.delete(id)

      // Using mock data for development
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setEmployees((prev) => prev.filter((emp) => emp.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Load employees on initial mount
  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return {
    employees,
    isLoading,
    error,
    fetchEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
