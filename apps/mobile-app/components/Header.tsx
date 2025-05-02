'use client'

import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'

interface HeaderProps {
  title: string
  showBackButton?: boolean
  onBackPress?: () => void
  rightIcon?: string
  onRightPress?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightIcon,
  onRightPress,
}) => {
  const { colors } = useTheme()

  return (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <Image
            source={{
              uri: 'https://img.freepik.com/free-vector/hot-pot-concept-illustration_114360-8670.jpg',
            }}
            style={styles.logo}
          />
        )}
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
          <Feather name={rightIcon as keyof typeof Feather.glyphMap} size={24} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  rightButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
})
