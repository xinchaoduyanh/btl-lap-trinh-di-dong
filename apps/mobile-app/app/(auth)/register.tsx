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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, useRouter } from "expo-router"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

// Components
import { FormInput } from "../../components/FormInput"
import { PrimaryButton } from "../../components/Buttons"

export default function RegisterScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register, isLoading } = useAuth()
  const { colors } = useTheme()

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    await register(fullName, email, password)
    router.replace("/login")
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
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                />

                <FormInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <FormInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                />

                <FormInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                />

                <PrimaryButton
                  title={isLoading ? "Creating Account..." : "Register"}
                  onPress={handleRegister}
                  disabled={isLoading}
                  style={{ backgroundColor: colors.primary }}
                />

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
})
