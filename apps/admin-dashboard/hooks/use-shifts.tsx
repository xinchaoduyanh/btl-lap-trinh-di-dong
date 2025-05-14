"use client"

import { useState, useEffect, useCallback } from "react"
import type { Shift, CreateShiftRequest, UpdateShiftRequest } from "@/types/schema"

// Mock data for development
const mockShifts: Shift[] = [
  {
    id: "1",
    name: "Morning Shift",
    startTime: "2023-05-01T08:00:00.000Z",
    endTime: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "2",
    name: "Evening Shift",
    startTime: "2023-05-01T16:00:00.000Z",
    endTime: "2023-05-02T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Night Shift",
    startTime: "2023-05-01T00:00:00.000Z",
    endTime: "2023-05-01T08:00:00.000Z",
  },
  {
    id: "4",
    name: "Weekend Morning",
    startTime: "2023-05-06T09:00:00.000Z",
    endTime: "2023-05-06T17:00:00.000Z",
  },
  {
    id: "5",
    name: "Weekend Evening",
    startTime: "2023-05-06T17:00:00.000Z",
    endTime: "2023-05-07T01:00:00.000Z",
  },
]

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all shifts
  const fetchShifts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/shifts')
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setShifts(mockShifts)
    } catch (err) {
      setError("Failed to fetch shifts")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single shift by ID
  const getShift = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/shifts/${id}`)
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const shift = mockShifts.find((s) => s.id === id)
      if (!shift) throw new Error("Shift not found")
      return shift
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new shift
  const createShift = useCallback(async (shiftData: CreateShiftRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/shifts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(shiftData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const newShift: Shift = {
        ...shiftData,
        id: Date.now().toString(),
      }
      setShifts((prev) => [...prev, newShift])
      return newShift
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing shift
  const updateShift = useCallback(async (id: string, shiftData: UpdateShiftRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/shifts/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(shiftData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setShifts((prev) => prev.map((shift) => (shift.id === id ? { ...shift, ...shiftData } : shift)))
      return { id, ...shiftData }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a shift
  const deleteShift = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/shifts/${id}`, { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setShifts((prev) => prev.filter((shift) => shift.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Load shifts on initial mount
  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  return {
    shifts,
    isLoading,
    error,
    fetchShifts,
    getShift,
    createShift,
    updateShift,
    deleteShift,
  }
}
