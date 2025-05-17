"use client"

import { useState, useEffect, useCallback } from "react"
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from "@/types/schema"
import api from "@/lib/axios"

export function useFood() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all menu items
  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/foods')
      setMenuItems(response.data)
    } catch (err) {
      setError("Failed to fetch menu items")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get a single menu item by ID
  const getMenuItem = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/foods/${id}`)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Create a new menu item
  const createMenuItem = useCallback(async (itemData: CreateMenuItemRequest) => {
    try {
      const response = await api.post('/foods', itemData)
      const newItem = response.data
      setMenuItems((prev) => [...prev, newItem])
      return newItem
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Update an existing menu item
  const updateMenuItem = useCallback(async (id: string, itemData: UpdateMenuItemRequest) => {
    try {
      const response = await api.patch(`/foods/${id}`, itemData)
      const updatedItem = response.data
      setMenuItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      return updatedItem
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Delete a menu item
  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      await api.delete(`/foods/${id}`)
      setMenuItems((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [])

  // Toggle menu item availability
  const toggleAvailability = useCallback(
    async (id: string, isAvailable: boolean) => {
      try {
        return await updateMenuItem(id, { isAvailable })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [updateMenuItem],
  )

  // Load menu items on initial mount
  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  return {
    menuItems,
    isLoading,
    error,
    fetchMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
  }
}
