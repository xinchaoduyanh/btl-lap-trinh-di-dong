"use client"
import React, { useEffect, useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../../context/ThemeContext"
import { useCheckout } from "../../../context/CheckoutContext"
import { UserData } from "@/constants/interface"
import { Feather } from "@expo/vector-icons"

// Components
import { Header } from "../../../components/Header"

interface HistoryItem {
  checkIn: string
  checkOut: string
}

export default function CheckInOutScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [user, setUser] = useState<UserData | null>(null)
  const { isCheckedIn, currentStatus, checkIn, checkOut, getCurrentStatus, loading, fetchHistory } = useCheckout()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [elapsedTime, setElapsedTime] = useState("0 giờ 0 phút 0 giây")

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (user?.id) {
      getCurrentStatus(user.id)
      loadHistory(user.id)
    }
  }, [user?.id])

  // Cập nhật thời gian đã làm việc mỗi giây khi đã check-in
  useEffect(() => {
    let interval: number
    if (isCheckedIn && currentStatus?.session?.checkIn) {
      interval = setInterval(() => {
        const checkInTime = new Date(currentStatus.session.checkIn).getTime()
        const now = new Date().getTime()
        const diff = now - checkInTime

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setElapsedTime(`${hours} giờ ${minutes} phút ${seconds} giây`)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCheckedIn, currentStatus?.session?.checkIn])

  const loadHistory = async (userId: string) => {
    const data = await fetchHistory(userId)
    setHistory(data)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn).getTime()
    const end = new Date(checkOut).getTime()
    const diff = end - start

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours} giờ ${minutes} phút`
  }

  const handleCheckInOut = async () => {
    if (!user?.id) return

    if (!isCheckedIn) {
      await checkIn(user.id)
    } else {
      await checkOut(user.id)
      // Cập nhật lịch sử sau khi checkout
      loadHistory(user.id)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Chấm Công" onBackPress={() => router.replace('/')} />

      <ScrollView style={styles.content}>
        <View style={styles.currentTimeContainer}>
          <Feather name="clock" size={60} color={colors.primary} />
          <Text style={styles.currentDate}>{formatDate(new Date())}</Text>
          <Text style={[styles.currentTime, { color: colors.primary }]}>
            {isCheckedIn ? elapsedTime : "0 giờ 0 phút 0 giây"}
          </Text>
        </View>

        <View style={styles.checkInOutContainer}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: isCheckedIn ? colors.success : colors.error }]} />
            <Text style={styles.statusText}>
              {isCheckedIn ? "Đang làm việc" : "Chưa vào ca"}
            </Text>
          </View>

          {isCheckedIn && currentStatus?.session?.checkIn && (
            <Text style={styles.checkInTimeText}>
              Đã vào ca lúc {formatTime(currentStatus.session.checkIn)}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.checkInOutButton,
              { backgroundColor: isCheckedIn ? colors.error : colors.success },
              loading && styles.disabledButton
            ]}
            onPress={handleCheckInOut}
            disabled={loading}
          >
            <Text style={styles.checkInOutButtonText}>
              {loading ? "Đang xử lý..." : isCheckedIn ? "Kết thúc ca" : "Bắt đầu ca"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Lịch sử làm việc gần đây</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/check-in/session-detail')} style={styles.detailButton}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
              <Feather name="clock" size={24} color={colors.primary} style={{ marginLeft: 8 }} />
            </View>
          </View>

          {history.length === 0 && !loading && (
            <Text style={styles.noHistoryText}>Chưa có lịch sử làm việc.</Text>
          )}

          {loading && (
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          )}

          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {formatDate(new Date(item.checkIn))}
              </Text>
              <View style={styles.historyDetails}>
                <View style={styles.historyTimeContainer}>
                  <Feather name="log-in" size={16} color={colors.success} />
                  <Text style={styles.historyTime}>Vào ca: {formatTime(item.checkIn)}</Text>
                </View>
                <View style={styles.historyTimeContainer}>
                  <Feather name="log-out" size={16} color={colors.error} />
                  <Text style={styles.historyTime}>Tan ca: {formatTime(item.checkOut)}</Text>
                </View>
                <View style={styles.historyTimeContainer}>
                  <Feather name="clock" size={16} color={colors.primary} />
                  <Text style={styles.historyTime}>
                    Thời gian: {calculateDuration(item.checkIn, item.checkOut)}
                  </Text>
                </View>
              </View>
            </View>
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
  currentDate: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  currentTime: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
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
    marginBottom: 12,
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
  },
  checkInTimeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  checkInOutButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  checkInOutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
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
    fontWeight: "600",
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
  },
  detailButtonText: {
    fontSize: 12,
    color: "#666",
  },
  historyItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  historyDetails: {
    flexDirection: "column",
    gap: 8,
  },
  historyTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyTime: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  noHistoryText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
    fontStyle: "italic",
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
    fontStyle: "italic",
  },
})
