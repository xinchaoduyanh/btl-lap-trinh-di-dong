import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext'
import { TableProvider } from '../context/TableContext'
import { useColorScheme } from '@/hooks/useColorScheme'
import { CheckoutProvider } from '@/context/CheckoutContext'
import { OrderProvider } from '@/context/OrderContext'
import { OrderItemProvider } from '../context/OrderItemContext'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  const router = useRouter()

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
    checkAuth()
  }, [loaded, router])

  const checkAuth = async () => {
    try {
      const user = await AsyncStorage.getItem('user')
      if (user) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.replace('/(auth)/login')
    }
  }

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OrderItemProvider>
      <OrderProvider>
          <TableProvider>
            <CheckoutProvider>
              <CustomThemeProvider>
                <AuthProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style="auto" />
                </AuthProvider>
              </CustomThemeProvider>
            </CheckoutProvider>
          </TableProvider>
      </OrderProvider>
        </OrderItemProvider>
    </ThemeProvider>
  )
}
