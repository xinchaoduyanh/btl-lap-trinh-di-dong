'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  type Employee,
  Role,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
} from '@/types/schema'
import api from '@/lib/axios'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all employees
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/employees')
      setEmployees(response.data)
    } catch (err) {
      setError('Failed to fetch employees')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single employee by ID
  const getEmployee = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/employees/${id}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new employee
  const createEmployee = useCallback(async (employeeData: CreateEmployeeRequest) => {
    try {
      const response = await api.post('/employees', employeeData)
      const newEmployee = response.data
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
      const response = await api.patch(`/employees/${id}`, employeeData)
      const updatedEmployee = response.data
      setEmployees((prev) => prev.map((emp) => (emp.id === id ? updatedEmployee : emp)))
      return updatedEmployee
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete an employee
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await api.delete(`/employees/${id}`)
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
