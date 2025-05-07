"use client"
import React from "react"
import { useState } from "react"
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
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register, isLoading } = useAuth()
  const { colors } = useTheme()
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

  const handleRegister = async () => {
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    setError("")
    try {
      await register(fullName, email, password)
      showSuccessMessage()
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra, vui lòng thử lại")
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

                <FormInput
                  label="Name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text)
                    setError("")
                  }}
                  placeholder="Enter your name"
                  editable={!isLoading}
                />

                <FormInput
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    setError("")
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                <FormInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    setError("")
                  }}
                  placeholder="Enter your password"
                  secureTextEntry
                  editable={!isLoading}
                />

                <FormInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    setError("")
                  }}
                  placeholder="Confirm your password"
                  secureTextEntry
                  editable={!isLoading}
                />

                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title={isLoading ? "Creating Account..." : "Register"}
                    onPress={handleRegister}
                    disabled={isLoading}
                    style={{
                      backgroundColor: isLoading ? colors.background : colors.primary,
                      opacity: isLoading ? 0.7 : 1
                    }}
                  />
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      style={styles.loadingIndicator}
                    />
                  )}
                </View>

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
