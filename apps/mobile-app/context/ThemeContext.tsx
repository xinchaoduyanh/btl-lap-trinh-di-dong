"use client"

import  React from "react"
import { createContext, useContext, useState } from "react"

// Define theme colors
const lightTheme = {
  primary: "#FF8C00", // Orange
  secondary: "#FFD700", // Gold
  accent: "#FF6347", // Tomato
  highlight: "#E91E63", // Pink
  tertiary: "#9C27B0", // Purple
  success: "#4CAF50", // Green
  error: "#F44336", // Red
  info: "#2196F3", // Blue
  background: "#F5F5F5", // Light Gray
  card: "#FFFFFF", // White
  text: "#333333", // Dark Gray
}

// Define the shape of our context
type ThemeContextType = {
  colors: typeof lightTheme
  isDarkMode: boolean
  toggleTheme: () => void
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  colors: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
})

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext)

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // For now, we'll just use the light theme
  // In a real app, you would define a dark theme and toggle between them
  const colors = lightTheme

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}
