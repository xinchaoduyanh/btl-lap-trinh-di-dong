"use client"
import React, { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, useRouter } from "expo-router"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

// Components
import { FormInput } from "../../components/FormInput"
import { PrimaryButton } from "../../components/Buttons"
import Fireworks from "../../components/Fireworks"

export default function RegisterScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { register, sendOtp, isLoading } = useAuth()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  const showSuccessMessage = () => {
    setSuccessMessage("Đăng ký thành công!")
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
      router.replace("/login")
    })
  }

  // Bước 1: Gửi OTP
  const handleSendOtp = async () => {
    if (!email) {
      setError("Vui lòng nhập email")
      return
    }
    setError("")
    try {
      await sendOtp(email)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Bước 2: Đăng ký
  const handleRegister = async () => {
    if (!otp || !fullName || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }
    setError("")
    try {
      await register(fullName, email, password, otp)
      Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.")
      showSuccessMessage()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {successMessage ? (
        <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
          <Fireworks />
          <Text style={styles.successText}>{successMessage}</Text>
        </Animated.View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: "https://img.freepik.com/free-vector/hot-pot-concept-illustration_114360-8670.jpg" }}
              style={styles.logo}
            />
            <Text style={[styles.appName, { color: colors.primary }]}>ITHotpot</Text>
          </View>

          <View style={styles.formContainer}>
            <ImageBackground
              source={{ uri: "https://img.freepik.com/free-vector/hand-drawn-hot-pot-illustration_23-2149175802.jpg" }}
              style={styles.formBackground}
              imageStyle={styles.formBackgroundImage}
            >
              <View style={styles.formOverlay}>
                <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>

                {step === 1 ? (
                  <View>
                    <FormInput
                      label="Email"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Nhập email"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                    {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
                    <PrimaryButton
                      title={isLoading ? "Đang gửi OTP..." : "Gửi OTP"}
                      onPress={handleSendOtp}
                      disabled={isLoading}
                    />
                  </View>
                ) : (
                  <View>
                    <Text>Email: <Text style={{ fontWeight: "bold" }}>{email}</Text></Text>
                    <FormInput
                      label="OTP"
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Nhập mã OTP"
                      keyboardType="number-pad"
                      editable={!isLoading}
                    />
                    <FormInput
                      label="Tên"
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Nhập tên"
                      editable={!isLoading}
                    />
                    <FormInput
                      label="Mật khẩu"
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Nhập mật khẩu"
                      secureTextEntry
                      editable={!isLoading}
                    />
                    <FormInput
                      label="Xác nhận mật khẩu"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Nhập lại mật khẩu"
                      secureTextEntry
                      editable={!isLoading}
                    />
                    {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
                    <PrimaryButton
                      title={isLoading ? "Đang đăng ký..." : "Đăng ký"}
                      onPress={handleRegister}
                      disabled={isLoading}
                    />
                  </View>
                )}

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Link href="/login" asChild>
                    <TouchableOpacity>
                      <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  formContainer: {
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formBackground: {
    width: "100%",
  },
  formBackgroundImage: {
    opacity: 0.1,
  },
  formOverlay: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
  },
  successContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    transform: [{ translateY: -50 }],
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    padding: 20,
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
})
