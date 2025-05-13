import React, { useEffect, useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from "../../context/ThemeContext"
import { useCheckout } from "../../context/CheckoutContext"
import { Feather } from "@expo/vector-icons"

interface Session {
  checkIn: string
  checkOut: string
  hoursWorked: string
}

export default function SessionDetailScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { loading, fetchSessionsByDate } = useCheckout()
  const [sessions, setSessions] = useState<Session[]>([])
  const [totalWorked, setTotalWorked] = useState("")
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    (async () => {
      const userData = await import("@react-native-async-storage/async-storage").then(m => m.default.getItem("user"))
      if (userData) setUser(JSON.parse(userData))
    })()
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadSessions(user.id, date)
    }
  }, [user, date])

  const loadSessions = async (userId: string, dateObj: Date) => {
    setSessions([])
    setTotalWorked("")
    const yyyy = dateObj.getFullYear()
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const data = await fetchSessionsByDate(userId, dateStr)
    setSessions(data.sessions || [])
    setTotalWorked(data.totalWorked || "")
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết ngày làm việc</Text>
      </View>
      <View style={styles.datePickerRow}>
        <Text style={styles.dateLabel}>Ngày:</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
          <Feather name="calendar" size={18} color={colors.primary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false)
            if (selectedDate) setDate(selectedDate)
          }}
        />
      )}
      <ScrollView style={styles.content}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng thời gian làm việc:</Text>
          <Text style={styles.summaryValue}>{totalWorked}</Text>
        </View>
        {sessions.map((item, idx) => (
          <View key={idx} style={styles.sessionItem}>
            <View style={styles.sessionRow}>
              <Feather name="log-in" size={16} color={colors.success} />
              <Text style={styles.sessionTime}>{formatTime(item.checkIn)}</Text>
              <Feather name="log-out" size={16} color={colors.error} style={{ marginLeft: 16 }} />
              <Text style={styles.sessionTime}>{formatTime(item.checkOut)}</Text>
              <Feather name="clock" size={16} color={colors.primary} style={{ marginLeft: 16 }} />
              <Text style={styles.sessionTime}>{item.hoursWorked}</Text>
            </View>
          </View>
        ))}
        {(!sessions || sessions.length === 0) && (
          <Text style={styles.noSessionText}>Không có dữ liệu cho ngày này.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  sessionItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  noSessionText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
    fontSize: 16,
  },
})
