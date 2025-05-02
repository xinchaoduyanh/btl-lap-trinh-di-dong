import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'

interface Profile {
  email: string
  phone: string
  address: string
  emergencyContact: string
}

interface ProfileInfoCardProps {
  profile: Profile
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ profile }) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          <Feather name="mail" size={16} color="#666" />
          <Text style={styles.infoLabelText}>Email</Text>
        </View>
        <Text style={styles.infoValue}>{profile.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          <Feather name="phone" size={16} color="#666" />
          <Text style={styles.infoLabelText}>Phone</Text>
        </View>
        <Text style={styles.infoValue}>{profile.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          <Feather name="map-pin" size={16} color="#666" />
          <Text style={styles.infoLabelText}>Address</Text>
        </View>
        <Text style={styles.infoValue}>{profile.address}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          <Feather name="alert-circle" size={16} color="#666" />
          <Text style={styles.infoLabelText}>Emergency Contact</Text>
        </View>
        <Text style={styles.infoValue}>{profile.emergencyContact}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  infoLabelText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
})
