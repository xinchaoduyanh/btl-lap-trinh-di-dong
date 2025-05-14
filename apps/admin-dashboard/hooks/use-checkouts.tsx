"use client"

import { useState, useEffect, useCallback } from "react"
import { type Checkout, CheckoutStatus, type CreateCheckoutRequest, type UpdateCheckoutRequest } from "@/types/schema"

// Mock data for development
const mockCheckouts: Checkout[] = [
  {
    id: "1",
    employeeId: "1",
    checkIn: "2023-05-01T08:00:00.000Z",
    checkOut: "2023-05-01T16:00:00.000Z",
    status: CheckoutStatus.CHECKED_OUT,
    createdAt: "2023-05-01T08:00:00.000Z",
    updatedAt: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "2",
    employeeId: "2",
    checkIn: "2023-05-01T16:00:00.000Z",
    checkOut: null,
    status: CheckoutStatus.CHECKED_IN,
    createdAt: "2023-05-01T16:00:00.000Z",
    updatedAt: "2023-05-01T16:00:00.000Z",
  },
  {
    id: "3",
    employeeId: "3",
    checkIn: "2023-05-02T08:00:00.000Z",
    checkOut: "2023-05-02T16:00:00.000Z",
    status: CheckoutStatus.CHECKED_OUT,
    createdAt: "2023-05-02T08:00:00.000Z",
    updatedAt: "2023-05-02T16:00:00.000Z",
  },
  {
    id: "4",
    employeeId: "4",
    checkIn: "2023-05-02T16:00:00.000Z",
    checkOut: null,
    status: CheckoutStatus.CHECKED_IN,
    createdAt: "2023-05-02T16:00:00.000Z",
    updatedAt: "2023-05-02T16:00:00.000Z",
  },
]

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all checkouts
  const fetchCheckouts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/checkouts')
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setCheckouts(mockCheckouts)
    } catch (err) {
      setError("Failed to fetch checkouts")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single checkout by ID
  const getCheckout = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/checkouts/${id}`)
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
      const checkout = mockCheckouts.find((c) => c.id === id)
      if (!checkout) throw new Error("Checkout not found")
      return checkout
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new checkout (check in)
  const createCheckout = useCallback(async (checkoutData: CreateCheckoutRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/checkouts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(checkoutData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const now = new Date().toISOString()
      const newCheckout: Checkout = {
        ...checkoutData,
        id: Date.now().toString(),
        checkIn: checkoutData.checkIn ?? now,
        checkOut: checkoutData.checkOut ?? null,
        status: checkoutData.status ?? CheckoutStatus.CHECKED_IN,
        createdAt: now,
        updatedAt: now,
      }
      setCheckouts((prev) => [...prev, newCheckout])
      return newCheckout
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing checkout
  const updateCheckout = useCallback(async (id: string, checkoutData: UpdateCheckoutRequest) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/checkouts/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(checkoutData)
      // })
      // const data = await response.json()

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      const now = new Date().toISOString()
      setCheckouts((prev) =>
        prev.map((checkout) => (checkout.id === id ? { ...checkout, ...checkoutData, updatedAt: now } : checkout)),
      )
      return { id, ...checkoutData, updatedAt: now }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a checkout
  const deleteCheckout = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/checkouts/${id}`, { method: 'DELETE' })

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setCheckouts((prev) => prev.filter((checkout) => checkout.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Check out an employee
  const checkOutEmployee = useCallback(
    async (id: string) => {
      try {
        const now = new Date().toISOString()
        return await updateCheckout(id, {
          checkOut: now,
          status: CheckoutStatus.CHECKED_OUT,
        })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [updateCheckout],
  )

  // Get active checkouts (employees currently checked in)
  const getActiveCheckouts = useCallback(() => {
    return checkouts.filter((checkout) => checkout.status === CheckoutStatus.CHECKED_IN)
  }, [checkouts])

  // Load checkouts on initial mount
  useEffect(() => {
    fetchCheckouts()
  }, [fetchCheckouts])

  return {
    checkouts,
    isLoading,
    error,
    fetchCheckouts,
    getCheckout,
    createCheckout,
    updateCheckout,
    deleteCheckout,
    checkOutEmployee,
    getActiveCheckouts,
  }
}
