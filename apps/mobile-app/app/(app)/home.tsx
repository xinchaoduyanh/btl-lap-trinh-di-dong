import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/(auth)/login');
  };

  const actionTiles = [
    {
      id: 1,
      title: 'Check In/Out',
      icon: 'clock',
      color: '#4CAF50',
      screen: '/(app)/check-in-out'
    },
    {
      id: 2,
      title: 'Order Management',
      icon: 'shopping-cart',
      color: '#2196F3',
      screen: '/(app)/order-management'
    },
    {
      id: 3,
      title: 'Table Management',
      icon: 'grid',
      color: '#FF9800',
      screen: '/(app)/table-management'
    },
    {
      id: 4,
      title: 'Notifications',
      icon: 'bell',
      color: '#9C27B0',
      screen: '/(app)/notifications',
      badge: '3'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>ITHotpot Staff</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={24} color="red" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.tilesContainer}>
          {actionTiles.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={[styles.tile, { backgroundColor: tile.color }]}
              onPress={() => router.push(tile.screen as any)}
            >
              <Feather name={tile.icon as any} size={32} color="white" />
              <Text style={[styles.tileTitle, { color: colors.text }]}>{tile.title}</Text>
              {tile.badge && (
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>{tile.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  tile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tileTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center'
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  badgeText: {
    color: 'white',
    fontSize: 12
  },
  logoutButton: {
    padding: 8
  }
});
