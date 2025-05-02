import React from 'react'
import { StyleSheet, View, Text, TextInput } from 'react-native'

interface Profile {
  email: string
  phone: string
  address: string
  emergencyContact: string
}

interface ProfileEditFormProps {
  profile: Profile
  onChange: (field: string, value: string) => void
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ profile, onChange }) => {
  return (
    <View style={styles.formCard}>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          onChangeText={(text) => onChange('email', text)}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => onChange('phone', text)}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          value={profile.address}
          onChangeText={(text) => onChange('address', text)}
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Emergency Contact</Text>
        <TextInput
          style={styles.input}
          value={profile.emergencyContact}
          onChangeText={(text) => onChange('emergencyContact', text)}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
})
