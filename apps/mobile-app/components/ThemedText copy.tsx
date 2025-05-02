"use client"
import React from "react"
import { Text, type TextProps, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"
import type { FC, ReactNode } from "react"

interface ThemedTextProps extends TextProps {
  children: ReactNode
  variant?: "default" | "title" | "subtitle" | "caption" | "label"
  color?: "primary" | "secondary" | "text" | "error" | "success" | "info"
}

export const ThemedText: FC<ThemedTextProps> = ({ children, variant = "default", color = "text", style, ...props }) => {
  const { colors } = useTheme()

  const getTextStyle = () => {
    switch (variant) {
      case "title":
        return styles.title
      case "subtitle":
        return styles.subtitle
      case "caption":
        return styles.caption
      case "label":
        return styles.label
      default:
        return styles.default
    }
  }

  const getTextColor = () => {
    switch (color) {
      case "primary":
        return colors.primary
      case "secondary":
        return colors.secondary
      case "error":
        return colors.error
      case "success":
        return colors.success
      case "info":
        return colors.info
      default:
        return colors.text
    }
  }

  return (
    <Text style={[getTextStyle(), { color: getTextColor() }, style]} {...props}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  default: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  caption: {
    fontSize: 12,
    color: "#666",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
})
