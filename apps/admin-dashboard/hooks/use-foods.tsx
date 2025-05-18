"use client"

import { useState, useEffect, useCallback } from "react"
import type { Food, CreateFoodRequest, UpdateFoodRequest } from "@/types/schema"
import api from "@/lib/axios"

export function useFood() {
  const [foods, setFoods] = useState<Food[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all foods
  const fetchFoods = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/foods')
      setFoods(response.data)
    } catch (err) {
      setError("Failed to fetch foods")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single food by ID
  const getFood = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/foods/${id}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new food
  const createFood = useCallback(async (itemData: CreateFoodRequest) => {
    try {
      const response = await api.post('/foods', itemData)
      const newItem = response.data
      setFoods((prev) => [...prev, newItem])
      return newItem
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing food
  const updateFood = useCallback(async (id: string, itemData: UpdateFoodRequest) => {
    try {
      const response = await api.patch(`/foods/${id}`, itemData)
      const updatedItem = response.data
      setFoods((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      return updatedItem
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a food
  const deleteFood = useCallback(async (id: string) => {
    try {
      await api.delete(`/foods/${id}`)
      setFoods((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Toggle food availability
  const toggleAvailability = useCallback(
    async (id: string, isAvailable: boolean) => {
      try {
        return await updateFood(id, { isAvailable })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [updateFood],
  )

  // Load foods on initial mount
  useEffect(() => {
    fetchFoods()
  }, [fetchFoods])

  return {
    foods,
    isLoading,
    error,
    fetchFoods,
    getFood,
    createFood,
    updateFood,
    deleteFood,
    toggleAvailability,
  }
}
