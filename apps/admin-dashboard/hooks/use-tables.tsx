'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Table, type CreateTableRequest, type UpdateTableRequest } from '@/types/schema'
import api from '@/lib/axios'

export function useTables() {
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all tables
  const fetchTables = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/tables')
      setTables(response.data)
    } catch (err) {
      setError('Failed to fetch tables')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single table by ID
  const getTable = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/tables/${id}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new table
  const createTable = useCallback(async (tableData: CreateTableRequest) => {
    try {
      const response = await api.post('/tables', tableData)
      const newTable = response.data
      setTables((prev) => [...prev, newTable])
      return newTable
    } catch (err) {
      throw err
    }
  }, [])

  // Update an existing table
  const updateTable = useCallback(async (id: string, tableData: UpdateTableRequest) => {
    try {
      const response = await api.patch(`/tables/${id}`, tableData)
      const updatedTable = response.data
      setTables((prev) => prev.map((table) => (table.id === id ? updatedTable : table)))
      return updatedTable
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a table
  const deleteTable = useCallback(async (id: string) => {
    try {
      await api.delete(`/tables/${id}`)
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
