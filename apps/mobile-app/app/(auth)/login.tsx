"use client"

import React, { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, router } from "expo-router"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

import AsyncStorage from '@react-native-async-storage/async-storage'
// Components
import { FormInput } from "../../components/FormInput"
import { PrimaryButton, SecondaryButton } from "../../components/Buttons"
import Fireworks from "../../components/Fireworks"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  const showSuccessMessage = (name: string) => {
    setSuccessMessage(`Chào mừng trở lại, ${name}!`)
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
      router.replace('/(tabs)')
    })
  }

  const handleLogin = async () => {
    if (isLoading) return
    setError("")

    setIsLoading(true)
    try {
      await login(email, password)
      const userData = await AsyncStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        showSuccessMessage(parsedUser.name)
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
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
            <Text style={styles.appTagline}>Delicious Hotpot Experience</Text>
          </View>

          <View style={styles.formContainer}>
            <ImageBackground
              source={{ uri: "https://img.freepik.com/free-vector/hand-drawn-hot-pot-illustration_23-2149175802.jpg" }}
              style={styles.formBackground}
              imageStyle={styles.formBackgroundImage}
            >
              <View style={styles.formOverlay}>
                <Text style={[styles.title, { color: colors.text }]}>Staff Login</Text>

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

                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title={isLoading ? "Logging in..." : "Login"}
                    onPress={handleLogin}
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

                <SecondaryButton
                  title="Login with Google"
                  onPress={() => {}}
                  disabled={isLoading}
                  icon="log-in"
                />

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don&apos;t have an account? </Text>
                  <Link href="/register" asChild>
                    <TouchableOpacity>
                      <Text style={[styles.registerLink, { color: colors.primary }]}>Register</Text>
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
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  appTagline: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#666",
  },
  registerLink: {
    fontWeight: "bold",
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
