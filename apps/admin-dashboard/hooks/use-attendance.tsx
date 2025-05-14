"use client"

import { useState, useEffect, useCallback } from "react"
import type { Attendance, CreateAttendanceRequest, UpdateAttendanceRequest } from "@/types/schema"

// Mock data for development
const mockAttendance: Attendance[] = [
  {
    id: "1",
    employeeId: "1",
    shiftId: "1",
    checkIn: "2023-05-01T08:00:00.000Z",
    checkOut: "2023-05-01T16:00:00.000Z",
    createdAt: "2023-05-01T08:00:00.000Z",
  },
  {
    id: "2",
    employeeId: "2",
    shiftId: "2",
    checkIn: "2023-05-01T16:00:00.000Z",
    checkOut: "2023-05-02T00:00:00.000Z",
    createdAt: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "3",
    employeeId: "3",
    shiftId: "1",
    checkIn: "2023-05-02T08:00:00.000Z",
    checkOut: "2023-05-02T16:00:00.000Z",
    createdAt: "2023-05-02T08:00:00.000Z",
  },
  {
    id: "4",
    employeeId: "4",
    shiftId: "2",
    checkIn: "2023-05-02T16:00:00.000Z",
    checkOut: "2023-05-03T00:00:00.000Z",
    createdAt: "2023-05-02T16:00:00.000Z",
  },
  {
    id: "5",
    employeeId: "5",
    shiftId: "1",
    checkIn: "2023-05-03T08:00:00.000Z",
    checkOut: "2023-05-03T16:00:00.000Z",
    createdAt: "2023-05-03T08:00:00.000Z",
  },
]

export function useAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all attendance records
  const fetchAttendance = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/attendance')
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setAttendance(mockAttendance)
    } catch (err) {
      setError("Failed to fetch attendance records")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single attendance record by ID
  const getAttendanceRecord = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/attendance/${id}`)
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const record = mockAttendance.find((a) => a.id === id)
      if (!record) throw new Error("Attendance record not found")
      return record
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new attendance record
  const createAttendanceRecord = useCallback(async (recordData: CreateAttendanceRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/attendance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(recordData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const newRecord: Attendance = {
        ...recordData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      setAttendance((prev) => [...prev, newRecord])
      return newRecord
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing attendance record
  const updateAttendanceRecord = useCallback(async (id: string, recordData: UpdateAttendanceRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/attendance/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(recordData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setAttendance((prev) => prev.map((record) => (record.id === id ? { ...record, ...recordData } : record)))
      return { id, ...recordData }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete an attendance record
  const deleteAttendanceRecord = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/attendance/${id}`, { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setAttendance((prev) => prev.filter((record) => record.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Record check out
  const recordCheckOut = useCallback(
    async (id: string, checkOutTime: string) => {
      try {
        return await updateAttendanceRecord(id, { checkOut: checkOutTime })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [updateAttendanceRecord],
  )

  // Load attendance records on initial mount
  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  return {
    attendance,
    isLoading,
    error,
    fetchAttendance,
    getAttendanceRecord,
    createAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    recordCheckOut,
  }
}
