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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, router } from "expo-router"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

import AsyncStorage from '@react-native-async-storage/async-storage'
// Components
import { FormInput } from "../../components/FormInput"
import { PrimaryButton, SecondaryButton } from "../../components/Buttons"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await login(email, password)
      await AsyncStorage.setItem('user', JSON.stringify({ email }))
      router.replace('/(app)/home')
    } catch (error) {
      console.error('Login error:', error)
      alert('Có lỗi xảy ra khi đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                <FormInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  editable={!isLoading}
                />

                <PrimaryButton
                  title={isLoading ? "Logging in..." : "Login"}
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? colors.background : colors.primary,
                    opacity: isLoading ? 0.7 : 1
                  }}
                />

                <SecondaryButton title="Login with Google" onPress={() => {}} disabled={isLoading} icon="log-in" />

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
})
