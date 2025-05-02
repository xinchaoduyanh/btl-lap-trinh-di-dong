"use client"
import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "../../context/ThemeContext"

// Components
import { Header } from "../../components/Header"
import { AttendanceHistoryItem } from "../../components/AttendanceHistoryItem"

export default function CheckInOutScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState([
    {
      date: "2023-05-01",
      checkIn: "08:30 AM",
      checkOut: "05:15 PM",
      hoursWorked: "8h 45m",
    },
    {
      date: "2023-05-02",
      checkIn: "08:45 AM",
      checkOut: "05:30 PM",
      hoursWorked: "8h 45m",
    },
    {
      date: "2023-05-03",
      checkIn: "08:15 AM",
      checkOut: "05:00 PM",
      hoursWorked: "8h 45m",
    },
  ])

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleCheckInOut = () => {
    if (!isCheckedIn) {
      // Check in
      const now = new Date()
      setCheckInTime(now)
      setIsCheckedIn(true)
      Alert.alert("Success", `Checked in at ${formatTime(now)}`)

      // This is where you would call your API to record check-in
    } else {
      // Check out
      const now = new Date()
      setCheckOutTime(now)
      setIsCheckedIn(false)

      // Calculate hours worked
      const hoursWorked = checkInTime ? ((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2) : "0"

      Alert.alert("Success", `Checked out at ${formatTime(now)}\nHours worked: ${hoursWorked}h`)

      // This is where you would call your API to record check-out

      // Add to history (in a real app, this would come from the API)
      const newEntry = {
        date: now.toISOString().split("T")[0],
        checkIn: formatTime(checkInTime as Date),
        checkOut: formatTime(now),
        hoursWorked: `${Math.floor(Number(hoursWorked))}h ${Math.round((Number(hoursWorked) % 1) * 60)}m`,
      }

      setAttendanceHistory([newEntry, ...attendanceHistory])
      setCheckInTime(null)
      setCheckOutTime(null)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Attendance" onBackPress={() => router.back()} />

      <ScrollView style={styles.content}>
        <View style={styles.currentTimeContainer}>
          <Image
            source={{ uri: "https://img.freepik.com/free-vector/flat-design-clock-icon_23-2149155126.jpg" }}
            style={styles.clockIcon}
          />
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
          <Text style={[styles.currentTime, { color: colors.primary }]}>{formatTime(currentTime)}</Text>
        </View>

        <View style={styles.checkInOutContainer}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: isCheckedIn ? colors.success : colors.error }]} />
            <Text style={styles.statusText}>{isCheckedIn ? "Currently Working" : "Not Checked In"}</Text>
          </View>

          {isCheckedIn && checkInTime && (
            <Text style={styles.checkInTimeText}>Checked in at {formatTime(checkInTime)}</Text>
          )}

          <TouchableOpacity
            style={[styles.checkInOutButton, { backgroundColor: isCheckedIn ? colors.error : colors.success }]}
            onPress={handleCheckInOut}
          >
            <Text style={styles.checkInOutButtonText}>{isCheckedIn ? "Check Out" : "Check In"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Attendance History</Text>
            <Image
              source={{ uri: "https://img.freepik.com/free-vector/calendar-icon-white-background_1308-84634.jpg" }}
              style={styles.historyIcon}
            />
          </View>

          {attendanceHistory.map((record, index) => (
            <AttendanceHistoryItem key={index} record={record} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  currentTimeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  clockIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
  },
  currentDate: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: "bold",
  },
  checkInOutContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  checkInTimeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  checkInOutButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  checkInOutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  historyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
})
