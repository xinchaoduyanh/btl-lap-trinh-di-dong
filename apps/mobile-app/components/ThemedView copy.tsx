"use client"

import { View, type ViewProps, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"
import type { FC, ReactNode } from "react"
import React from "react"
interface ThemedViewProps extends ViewProps {
  children: ReactNode
  variant?: "default" | "card" | "container" | "header" | "footer"
  backgroundColor?: "primary" | "secondary" | "background" | "card" | "transparent"
}

export const ThemedView: FC<ThemedViewProps> = ({
  children,
  variant = "default",
  backgroundColor = "background",
  style,
  ...props
}) => {
  const { colors } = useTheme()

  const getViewStyle = () => {
    switch (variant) {
      case "card":
        return styles.card
      case "container":
        return styles.container
      case "header":
        return styles.header
      case "footer":
        return styles.footer
      default:
        return styles.default
    }
  }

  const getBackgroundColor = () => {
    switch (backgroundColor) {
      case "primary":
        return colors.primary
      case "secondary":
        return colors.secondary
      case "card":
        return colors.card
      case "transparent":
        return "transparent"
      default:
        return colors.background
    }
  }

  return (
    <View style={[getViewStyle(), { backgroundColor: getBackgroundColor() }, style]} {...props}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  default: {
    // Default styles
  },
  card: {
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
})
