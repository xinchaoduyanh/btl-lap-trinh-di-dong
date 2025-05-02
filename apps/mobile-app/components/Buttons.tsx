import React from "react"
import { StyleSheet, TouchableOpacity, Text, type ViewStyle, type TextStyle } from "react-native"
import { Feather } from "@expo/vector-icons"

interface ButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  icon?: string
}

export const PrimaryButton: React.FC<ButtonProps> = ({ title, onPress, disabled = false, style, textStyle, icon }) => {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <Feather name={icon as keyof typeof Feather.glyphMap} size={18} color="white" style={styles.buttonIcon} />}
      <Text style={[styles.primaryButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

export const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[styles.secondaryButton, style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <Feather name={icon as keyof typeof Feather.glyphMap} size={18} color="#333" style={styles.buttonIcon} />}
      <Text style={[styles.secondaryButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

export const DangerButton: React.FC<ButtonProps> = ({ title, onPress, disabled = false, style, textStyle, icon }) => {
  return (
    <TouchableOpacity
      style={[styles.dangerButton, style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <Feather name={icon as keyof typeof Feather.glyphMap} size={18} color="white" style={styles.buttonIcon} />}
      <Text style={[styles.dangerButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  dangerButton: {
    backgroundColor: "#F44336",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
})
