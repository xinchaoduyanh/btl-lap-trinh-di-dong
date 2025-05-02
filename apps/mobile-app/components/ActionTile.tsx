import  React from "react"
import { StyleSheet, TouchableOpacity, Text, View } from "react-native"
import { Feather } from "@expo/vector-icons"

interface ActionTileProps {
  title: string
  icon: keyof typeof Feather.glyphMap
  color: string
  badge?: number
  onPress: () => void
}

export const ActionTile: React.FC<ActionTileProps> = ({ title, icon, color, badge, onPress }) => {
  return (
    <TouchableOpacity style={[styles.tile, { backgroundColor: color }]} onPress={onPress}>
      <View style={styles.tileContent}>
        <Feather name={icon} size={32} color="white" />
        <Text style={styles.tileTitle}>{title}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tile: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tileContent: {
    alignItems: "center",
  },
  tileTitle: {
    color: "white",
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
})
