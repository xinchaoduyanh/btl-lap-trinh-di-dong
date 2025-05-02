import React from "react"
import { StyleSheet, View, Text } from "react-native"
import { Feather } from "@expo/vector-icons"

interface AttendanceRecord {
  date: string
  checkIn: string
  checkOut: string
  hoursWorked: string
}

interface AttendanceHistoryItemProps {
  record: AttendanceRecord
}

export const AttendanceHistoryItem: React.FC<AttendanceHistoryItemProps> = ({ record }) => {
  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>{record.date}</Text>
      <View style={styles.historyDetails}>
        <View style={styles.historyTimeContainer}>
          <Feather name="log-in" size={16} color="#4CAF50" />
          <Text style={styles.historyTime}>{record.checkIn}</Text>
        </View>
        <View style={styles.historyTimeContainer}>
          <Feather name="log-out" size={16} color="#F44336" />
          <Text style={styles.historyTime}>{record.checkOut}</Text>
        </View>
        <View style={styles.historyTimeContainer}>
          <Feather name="clock" size={16} color="#2196F3" />
          <Text style={styles.historyTime}>{record.hoursWorked}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  historyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyTime: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
})
