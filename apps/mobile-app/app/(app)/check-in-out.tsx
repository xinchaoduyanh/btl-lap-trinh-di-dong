"use client"

import { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { useTheme } from "../../context/ThemeContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { config } from "../../config/env"
import type { EmployeeStatus, AttendanceSession } from "../../constants/interface"

// API base URL
const API_BASE_URL = config.API_URL

// Get screen dimensions for responsive design
const { width } = Dimensions.get("window")

// Hotpot theme colors
const hotpotTheme = {
  primary: "#E94B3C", // Spicy red
  secondary: "#F2A65A", // Warm orange
  accent: "#772F1A", // Rich brown
  background: "#FFF8F0", // Warm cream
  card: "#FFFFFF", // White
  text: "#2D2926", // Dark charcoal
  textLight: "#6D6A67", // Light gray
  success: "#58B09C", // Mint green
  error: "#E94B3C", // Same as primary for consistency
}

// Helper function to generate an array of years for the year picker
const getYears = () => {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 10 // Show 10 years back
  const endYear = currentYear + 10 // Show 10 years forward
  const years = []
  for (let i = startYear; i <= endYear; i++) {
    years.push(i)
  }
  return years
}

// Array of month names for the month picker
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

// Function to get the number of days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

export default function CheckInOutScreen() {
  const { colors } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceSession[]>([])
  const [totalWorked, setTotalWorked] = useState<string>("0h 0m")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [employeeId, setEmployeeId] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Date picker states
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showDayPicker, setShowDayPicker] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate())

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const clockOpacityAnim = useRef(new Animated.Value(1)).current
  const steamAnim1 = useRef(new Animated.Value(0)).current
  const steamAnim2 = useRef(new Animated.Value(0)).current

  // Track if component is mounted
  const isMounted = useRef(true)

  useEffect(() => {
    // Get employee data from AsyncStorage
    const getEmployeeData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setEmployeeId(parsedUser.id)
          setEmployeeName(parsedUser.name)
        } else {
          router.replace("/login")
        }
      } catch (error) {
        console.error("Error getting user data:", error)
        Alert.alert("Error", "Could not retrieve user data")
      }
    }

    getEmployeeData()

    // Clock animation
    const interval = setInterval(() => {
      if (isMounted.current) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start()

        Animated.sequence([
          Animated.timing(clockOpacityAnim, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(clockOpacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start()

        setCurrentTime(new Date())
      }
    }, 1000)

    // Steam animation
    const animateSteam = () => {
      if (!isMounted.current) return

      Animated.sequence([
        Animated.timing(steamAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(steamAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start()

      setTimeout(() => {
        if (!isMounted.current) return

        Animated.sequence([
          Animated.timing(steamAnim2, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(steamAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isMounted.current) {
            animateSteam()
          }
        })
      }, 1500)
    }

    animateSteam()

    return () => {
      isMounted.current = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (employeeId) {
      fetchCurrentStatus()
      fetchAttendanceHistory()
    }
  }, [employeeId])

  // Load saved date from AsyncStorage
  useEffect(() => {
    const loadSavedDate = async () => {
      try {
        const savedDate = await AsyncStorage.getItem("selectedDateHistory")
        if (savedDate) {
          const date = new Date(savedDate)
          if (!isNaN(date.getTime())) {
            setSelectedDate(date)
            setSelectedYear(date.getFullYear())
            setSelectedMonth(date.getMonth())
            setSelectedDay(date.getDate())
            setActiveTab("date")
            fetchAttendanceHistory(savedDate)
          }
        }
      } catch (error) {
        console.error("Error loading saved date:", error)
      }
    }

    loadSavedDate()
  }, [employeeId])

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSuccessMessage("")
    })
  }

  const fetchCurrentStatus = async () => {
    if (!employeeId) return

    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`${API_BASE_URL}/checkout/status/${employeeId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: EmployeeStatus = await response.json()
      setEmployeeStatus(data)
    } catch (error) {
      console.error("Error fetching status:", error)
      setError("Failed to fetch current status")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAttendanceHistory = async (date?: string) => {
    if (!employeeId || !isMounted.current) return

    try {
      setIsLoading(true)
      setError("")
      setAttendanceHistory([])

      let url = `${API_BASE_URL}/checkout/history/${employeeId}`
      if (date) {
        // Add cache-busting parameter to prevent caching issues
        url += `?date=${date}&t=${Date.now()}`
      }

      console.log("Fetching history with URL:", url)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      // Handle both array and { sessions, totalWorked } formats
      const sessions = Array.isArray(data) ? data : data.sessions || []

      // Filter sessions by date if provided
      let filteredSessions = sessions
      if (date) {
        // Ensure we're comparing dates in YYYY-MM-DD format
        const targetDate = date.split("T")[0]

        filteredSessions = sessions.filter((session: AttendanceSession) => {
          const sessionDate = new Date(session.checkIn).toISOString().split("T")[0]
          return sessionDate === targetDate
        })

        console.log(`Filtered ${sessions.length} sessions to ${filteredSessions.length} for date ${targetDate}`)
      }

      if (isMounted.current) {
        setAttendanceHistory(filteredSessions)

        // Calculate total worked time from filtered sessions
        const totalSeconds = filteredSessions.reduce((total: number, session: AttendanceSession) => {
          if (session.checkOut) {
            const diffMs = new Date(session.checkOut).getTime() - new Date(session.checkIn).getTime()
            return total + diffMs / 1000
          }
          return total
        }, 0)

        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        setTotalWorked(`${hours}h ${minutes}m`)
      }
    } catch (error) {
      console.error("Error fetching history:", error)
      if (isMounted.current) {
        setError("Failed to fetch attendance history")
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  const handleCheckIn = async () => {
    if (!employeeId || isCheckingIn) return

    try {
      setIsCheckingIn(true)
      setError("")

      const response = await fetch(`${API_BASE_URL}/checkout/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      await fetchCurrentStatus()
      await fetchAttendanceHistory()

      showSuccessMessage(`Checked in at ${formatTime(new Date())}`)
    } catch (error) {
      console.error("Error checking in:", error)
      setError("Failed to check in. Please try again.")
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!employeeId || isCheckingOut) return

    try {
      setIsCheckingOut(true)
      setError("")

      const response = await fetch(`${API_BASE_URL}/checkout/check-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      await fetchCurrentStatus()
      await fetchAttendanceHistory()

      const hoursWorked = calculateHoursWorked(data.checkIn, data.checkOut)
      showSuccessMessage(`Checked out. Worked ${hoursWorked}.`)
    } catch (error) {
      console.error("Error checking out:", error)
      setError("Failed to check out. Please try again.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
      setActiveTab("date")
      const formattedDate = date.toISOString().split("T")[0] // e.g., "2025-05-13"
      fetchAttendanceHistory(formattedDate)
    }
  }

  const handleBack = () => {
    router.push("/home")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDisplayTime = (dateString: string | null) => {
    if (!dateString) return "Pending"
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatSelectedDate = (date: Date | null) => {
    if (!date) return "Select Date"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0]
    const checkDate = new Date(dateString).toISOString().split("T")[0]
    return today === checkDate
  }

  const calculateHoursWorked = (checkIn: string, checkOut: string) => {
    const checkInTime = new Date(checkIn).getTime()
    const checkOutTime = new Date(checkOut).getTime()
    const diffMs = checkOutTime - checkInTime
    const totalSeconds = diffMs / 1000
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const isCheckedIn = employeeStatus?.status === "CHECKED_IN"

  // Modify the confirmDate function to ensure it properly sets the state

  // Add a useEffect to load the saved date when the component mounts

  // Modify the tab change handler to clear the saved date when switching to "all"

  const openDatePicker = () => {
    // If there's already a selected date, use it as the starting point
    if (selectedDate) {
      setSelectedYear(selectedDate.getFullYear())
      setSelectedMonth(selectedDate.getMonth())
      setSelectedDay(selectedDate.getDate())
    } else {
      // Otherwise use today's date
      const today = new Date()
      setSelectedYear(today.getFullYear())
      setSelectedMonth(today.getMonth())
      setSelectedDay(today.getDate())
    }

    setShowDatePicker(true)
    setShowYearPicker(true) // Start with year selection
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setShowYearPicker(false)
    setShowMonthPicker(true)
  }

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month)
    setShowMonthPicker(false)
    setShowDayPicker(true)
  }

  const handleDaySelect = (day: number) => {
    setSelectedDay(day)
    setShowDayPicker(false)

    // Create the full date and confirm it
    const newDate = new Date(selectedYear, selectedMonth, day)
    confirmDateInner(newDate)
  }

  const confirmDateInner = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Invalid date received:", date)
      return
    }

    console.log("Confirmed date:", date.toISOString())

    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]

    // Save to AsyncStorage for persistence
    AsyncStorage.setItem("selectedDateHistory", formattedDate).catch((err) =>
      console.error("Error saving selected date:", err),
    )

    setSelectedDate(date)
    setActiveTab("date")
    fetchAttendanceHistory(formattedDate)
    setShowDatePicker(false)
  }

  const handleAllTabPressInner = () => {
    setActiveTab("all")
    setSelectedDate(null)
    AsyncStorage.removeItem("selectedDateHistory").catch((err) => console.error("Error removing saved date:", err))
    fetchAttendanceHistory()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: hotpotTheme.background }]}>
      {/* Success message overlay */}
      {successMessage && (
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: fadeAnim,
              backgroundColor: hotpotTheme.primary,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.05, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.successText}>{successMessage}</Text>
        </Animated.View>
      )}

      {/* Error message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: hotpotTheme.error + "15" }]}>
          <Text style={[styles.errorText, { color: hotpotTheme.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.errorDismissButton, { backgroundColor: hotpotTheme.error + "20" }]}
            onPress={() => setError("")}
          >
            <Text style={[styles.errorDismiss, { color: hotpotTheme.error }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: hotpotTheme.accent + "15" }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: hotpotTheme.card }]} onPress={handleBack}>
          <Text style={[styles.backButtonText, { color: hotpotTheme.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: hotpotTheme.text }]}>Check-in</Text>
        <View style={[styles.userBadge, { backgroundColor: hotpotTheme.card }]}>
          <View style={[styles.avatar, { backgroundColor: hotpotTheme.primary }]}>
            <Text style={styles.avatarText}>{employeeName[0]?.toUpperCase()}</Text>
          </View>
          <Text style={[styles.userName, { color: hotpotTheme.text }]}>{employeeName}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Clock Card */}
          <View style={[styles.card, { backgroundColor: hotpotTheme.card }]}>
            <View style={[styles.hotpotContainer, { backgroundColor: hotpotTheme.background }]}>
              <View style={[styles.clockIcon, { backgroundColor: hotpotTheme.secondary + "22" }]}>
                <Text style={[styles.clockIconText, { color: hotpotTheme.secondary }]}>⏰</Text>
              </View>

              {/* Steam animations */}
              <Animated.View
                style={[
                  styles.steam,
                  {
                    left: "40%",
                    opacity: steamAnim1,
                    transform: [
                      {
                        translateY: steamAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -40],
                        }),
                      },
                      {
                        scale: steamAnim1.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.6, 1, 0.3],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.steam,
                  {
                    left: "60%",
                    opacity: steamAnim2,
                    transform: [
                      {
                        translateY: steamAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -40],
                        }),
                      },
                      {
                        scale: steamAnim2.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.6, 1, 0.3],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            <View style={[styles.clockContainer, { backgroundColor: hotpotTheme.secondary + "15" }]}>
              <Text style={[styles.clockTitle, { color: hotpotTheme.text }]}>Current Time</Text>
              <Animated.Text
                style={[
                  styles.currentTime,
                  {
                    color: hotpotTheme.primary,
                    transform: [{ scale: pulseAnim }],
                    opacity: clockOpacityAnim,
                  },
                ]}
              >
                {formatTime(currentTime)}
              </Animated.Text>
              <Text style={[styles.currentDate, { color: hotpotTheme.textLight }]}>{formatDate(currentTime)}</Text>
            </View>

            <View style={styles.statusSection}>
              <View style={styles.statusContainer}>
                <View style={styles.statusTextContainer}>
                  <Text style={[styles.statusLabel, { color: hotpotTheme.textLight }]}>Status</Text>
                  <Text style={[styles.statusText, { color: hotpotTheme.text }]}>
                    {isCheckedIn ? "Currently Working" : "Not Checked In"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isCheckedIn ? hotpotTheme.success + "22" : hotpotTheme.error + "22" },
                  ]}
                >
                  <Text
                    style={[styles.statusBadgeText, { color: isCheckedIn ? hotpotTheme.success : hotpotTheme.error }]}
                  >
                    {isCheckedIn ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>

              {isCheckedIn && employeeStatus?.session?.checkIn && (
                <View style={[styles.infoBox, { backgroundColor: hotpotTheme.secondary + "15" }]}>
                  <Text style={[styles.infoLabel, { color: hotpotTheme.textLight }]}>Checked in at</Text>
                  <Text style={[styles.infoValue, { color: hotpotTheme.accent }]}>
                    {formatDisplayTime(employeeStatus.session.checkIn)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isCheckedIn ? hotpotTheme.error : hotpotTheme.success,
                    shadowColor: isCheckedIn ? hotpotTheme.error : hotpotTheme.success,
                  },
                  (isCheckingIn || isCheckingOut) && styles.disabledButton,
                ]}
                onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
                disabled={isCheckingIn || isCheckingOut}
              >
                {isCheckingIn || isCheckingOut ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>{isCheckedIn ? "Check Out" : "Check In"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* History Card */}
          <View style={[styles.card, { backgroundColor: hotpotTheme.card }]}>
            <View style={[styles.cardHeader, { borderBottomColor: hotpotTheme.accent + "15" }]}>
              <Text style={[styles.cardTitle, { color: hotpotTheme.text }]}>Attendance History</Text>
            </View>

            <View style={[styles.totalWorkedContainer, { backgroundColor: hotpotTheme.accent + "15" }]}>
              <Text style={[styles.totalWorkedLabel, { color: hotpotTheme.textLight }]}>Total Worked</Text>
              <Text style={[styles.totalWorkedValue, { color: hotpotTheme.accent }]}>{totalWorked}</Text>
            </View>

            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "all" && [styles.activeTab, { backgroundColor: hotpotTheme.primary }],
                ]}
                onPress={handleAllTabPressInner}
              >
                <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All Records</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "date" && [styles.activeTab, { backgroundColor: hotpotTheme.primary }],
                ]}
                onPress={openDatePicker}
              >
                <Text style={[styles.tabText, activeTab === "date" && styles.activeTabText]}>
                  {formatSelectedDate(selectedDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Date Picker Modal */}
            {showDatePicker && (
              <Modal transparent animationType="fade">
                <View style={styles.modalOverlay}>
                  <View style={[styles.datePickerContainer, { backgroundColor: hotpotTheme.card }]}>
                    {/* Year Picker */}
                    {showYearPicker && (
                      <>
                        <Text style={[styles.datePickerTitle, { color: hotpotTheme.text }]}>Select Year</Text>
                        <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
                          {getYears().map((year) => (
                            <TouchableOpacity
                              key={year}
                              style={[
                                styles.dateItem,
                                selectedYear === year && { backgroundColor: hotpotTheme.primary + "15" },
                                { borderColor: hotpotTheme.textLight + "20" },
                              ]}
                              onPress={() => handleYearSelect(year)}
                            >
                              <Text
                                style={[
                                  styles.dateItemText,
                                  { color: selectedYear === year ? hotpotTheme.primary : hotpotTheme.text },
                                  selectedYear === year && { fontWeight: "700" },
                                ]}
                              >
                                {year}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </>
                    )}

                    {/* Month Picker */}
                    {showMonthPicker && (
                      <>
                        <Text style={[styles.datePickerTitle, { color: hotpotTheme.text }]}>
                          Select Month ({selectedYear})
                        </Text>
                        <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
                          {monthNames.map((month, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.dateItem,
                                selectedMonth === index && { backgroundColor: hotpotTheme.primary + "15" },
                                { borderColor: hotpotTheme.textLight + "20" },
                              ]}
                              onPress={() => handleMonthSelect(index)}
                            >
                              <Text
                                style={[
                                  styles.dateItemText,
                                  { color: selectedMonth === index ? hotpotTheme.primary : hotpotTheme.text },
                                  selectedMonth === index && { fontWeight: "700" },
                                ]}
                              >
                                {month}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </>
                    )}

                    {/* Day Picker */}
                    {showDayPicker && (
                      <>
                        <Text style={[styles.datePickerTitle, { color: hotpotTheme.text }]}>
                          Select Day ({monthNames[selectedMonth]} {selectedYear})
                        </Text>
                        <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
                          <View style={styles.dayGrid}>
                            {[...Array(getDaysInMonth(selectedYear, selectedMonth))].map((_, index) => {
                              const day = index + 1
                              const date = new Date(selectedYear, selectedMonth, day)
                              const isCurrentDay = selectedDay === day
                              const isPastDate = date <= new Date()

                              return (
                                <TouchableOpacity
                                  key={day}
                                  style={[
                                    styles.dayItem,
                                    isCurrentDay && { backgroundColor: hotpotTheme.primary + "15" },
                                    { borderColor: hotpotTheme.textLight + "20" },
                                    !isPastDate && { opacity: 0.5 },
                                  ]}
                                  onPress={() => isPastDate && handleDaySelect(day)}
                                  disabled={!isPastDate}
                                >
                                  <Text
                                    style={[
                                      styles.dayItemText,
                                      { color: isCurrentDay ? hotpotTheme.primary : hotpotTheme.text },
                                      isCurrentDay && { fontWeight: "700" },
                                    ]}
                                  >
                                    {day}
                                  </Text>
                                </TouchableOpacity>
                              )
                            })}
                          </View>
                        </ScrollView>
                      </>
                    )}

                    <View style={styles.datePickerButtonContainer}>
                      <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: hotpotTheme.error }]}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>

                      {/* Back button for month and day pickers */}
                      {(showMonthPicker || showDayPicker) && (
                        <TouchableOpacity
                          style={[styles.backPickerButton, { backgroundColor: hotpotTheme.secondary }]}
                          onPress={() => {
                            if (showDayPicker) {
                              setShowDayPicker(false)
                              setShowMonthPicker(true)
                            } else if (showMonthPicker) {
                              setShowMonthPicker(false)
                              setShowYearPicker(true)
                            }
                          }}
                        >
                          <Text style={styles.cancelButtonText}>Back</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </Modal>
            )}

            <View style={styles.historyList}>
              {isLoading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color={hotpotTheme.primary} />
                  <Text style={[styles.loadingText, { color: hotpotTheme.textLight }]}>Loading history...</Text>
                </View>
              ) : attendanceHistory.length > 0 ? (
                attendanceHistory.map((session, index) => (
                  <View
                    key={index}
                    style={[
                      styles.historyItem,
                      {
                        backgroundColor: index % 2 === 0 ? hotpotTheme.background : hotpotTheme.card,
                        borderLeftColor: isToday(session.checkIn) ? hotpotTheme.primary : hotpotTheme.secondary,
                      },
                    ]}
                  >
                    <View style={styles.historyHeader}>
                      <View style={styles.historyDateContainer}>
                        <View
                          style={[
                            styles.historyIconContainer,
                            {
                              backgroundColor: isToday(session.checkIn)
                                ? hotpotTheme.primary + "22"
                                : hotpotTheme.secondary + "22",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.historyIconText,
                              {
                                color: isToday(session.checkIn) ? hotpotTheme.primary : hotpotTheme.secondary,
                              },
                            ]}
                          >
                            {formatDisplayDate(session.checkIn).split(" ")[1]}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.historyDateText, { color: hotpotTheme.text }]}>
                            {formatDisplayDate(session.checkIn)}
                          </Text>
                          {isToday(session.checkIn) && (
                            <View style={[styles.todayBadge, { backgroundColor: hotpotTheme.primary + "22" }]}>
                              <Text style={[styles.todayText, { color: hotpotTheme.primary }]}>Today</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={[styles.hoursContainer, { backgroundColor: hotpotTheme.accent + "15" }]}>
                        <Text style={[styles.hoursText, { color: hotpotTheme.accent }]}>
                          {session.checkOut ? calculateHoursWorked(session.checkIn, session.checkOut) : "In progress"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyTimeContainer}>
                      <View style={[styles.timeBlock, { backgroundColor: hotpotTheme.success + "15" }]}>
                        <Text style={[styles.timeLabel, { color: hotpotTheme.textLight }]}>Check In</Text>
                        <Text style={[styles.timeValue, { color: hotpotTheme.success }]}>
                          {formatDisplayTime(session.checkIn)}
                        </Text>
                      </View>
                      <View style={styles.timeSeparator}>
                        <View style={[styles.timeLine, { backgroundColor: hotpotTheme.textLight + "40" }]} />
                      </View>
                      <View style={[styles.timeBlock, { backgroundColor: hotpotTheme.error + "15" }]}>
                        <Text style={[styles.timeLabel, { color: hotpotTheme.textLight }]}>Check Out</Text>
                        <Text
                          style={[
                            styles.timeValue,
                            { color: session.checkOut ? hotpotTheme.error : hotpotTheme.textLight },
                          ]}
                        >
                          {formatDisplayTime(session.checkOut)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyStateIcon, { backgroundColor: hotpotTheme.secondary + "22" }]}>
                    <Text style={[styles.emptyStateIconText, { color: hotpotTheme.secondary }]}>📅</Text>
                  </View>
                  <Text style={[styles.emptyStateText, { color: hotpotTheme.textLight }]}>
                    {activeTab === "date"
                      ? `No attendance records found for ${formatSelectedDate(selectedDate)}`
                      : "No attendance records found"}
                  </Text>
                  {activeTab === "date" && (
                    <TouchableOpacity
                      style={[styles.emptyStateButton, { backgroundColor: hotpotTheme.primary + "15" }]}
                      onPress={() => {
                        setActiveTab("all")
                        fetchAttendanceHistory()
                      }}
                    >
                      <Text style={[styles.emptyStateButtonText, { color: hotpotTheme.primary }]}>
                        View All Records
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    flex: 1,
    marginLeft: 16,
    textAlign: "center",
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  hotpotContainer: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  clockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  clockIconText: {
    fontSize: 40,
  },
  steam: {
    position: "absolute",
    top: 40,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  clockContainer: {
    padding: 24,
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  clockTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 1,
  },
  currentDate: {
    fontSize: 16,
    marginTop: 8,
  },
  statusSection: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 2,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  actionButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  totalWorkedContainer: {
    padding: 16,
    borderRadius: 12,
    margin: 20,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalWorkedLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalWorkedValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    elevation: 2,
  },
  activeTab: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 0,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  historyList: {
    padding: 20,
    paddingTop: 0,
  },
  historyItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyIconText: {
    fontSize: 20,
    fontWeight: "700",
  },
  historyDateText: {
    fontSize: 16,
    fontWeight: "700",
  },
  todayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  todayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  hoursContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hoursText: {
    fontSize: 16,
    fontWeight: "700",
  },
  historyTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeBlock: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeSeparator: {
    width: 40,
    alignItems: "center",
  },
  timeLine: {
    height: 2,
    width: "100%",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingState: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  successContainer: {
    position: "absolute",
    top: "40%",
    left: 24,
    right: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 10,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  errorText: {
    fontSize: 16,
    flex: 1,
  },
  errorDismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  errorDismiss: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: "85%",
    maxHeight: "80%",
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  dateList: {
    maxHeight: 300,
    width: "100%",
  },
  dateItem: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    alignItems: "center",
  },
  dateItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  dayItem: {
    width: (width * 0.85 - 80) / 7, // Adjust based on container width
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  datePickerButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  backPickerButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
