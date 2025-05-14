"use client"

import { useState, useEffect, useCallback } from "react"
import { type Table, TableStatus, type CreateTableRequest, type UpdateTableRequest } from "@/types/schema"

// Mock data for development
const mockTables: Table[] = [
  { id: "1", number: 1, status: TableStatus.AVAILABLE },
  { id: "2", number: 2, status: TableStatus.OCCUPIED },
  { id: "3", number: 3, status: TableStatus.AVAILABLE },
  { id: "4", number: 4, status: TableStatus.RESERVED },
  { id: "5", number: 5, status: TableStatus.AVAILABLE },
  { id: "6", number: 6, status: TableStatus.OCCUPIED },
  { id: "7", number: 7, status: TableStatus.AVAILABLE },
  { id: "8", number: 8, status: TableStatus.AVAILABLE },
  { id: "9", number: 9, status: TableStatus.OCCUPIED },
  { id: "10", number: 10, status: TableStatus.RESERVED },
]

export function useTables() {
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all tables
  const fetchTables = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/tables')
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setTables(mockTables)
    } catch (err) {
      setError("Failed to fetch tables")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single table by ID
  const getTable = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/tables/${id}`)
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const table = mockTables.find((t) => t.id === id)
      if (!table) throw new Error("Table not found")
      return table
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new table
  const createTable = useCallback(async (tableData: CreateTableRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/tables', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tableData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const newTable: Table = {
        ...tableData,
        id: Date.now().toString(),
      }
      setTables((prev) => [...prev, newTable])
      return newTable
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing table
  const updateTable = useCallback(async (id: string, tableData: UpdateTableRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/tables/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tableData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setTables((prev) => prev.map((table) => (table.id === id ? { ...table, ...tableData } : table)))
      return { id, ...tableData }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a table
  const deleteTable = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/tables/${id}`, { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setTables((prev) => prev.filter((table) => table.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Load tables on initial mount
  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  return {
    tables,
    isLoading,
    error,
    fetchTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
  }
}
