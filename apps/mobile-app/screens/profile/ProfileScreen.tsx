"use client"

import { useState } from "react"
import { StyleSheet, View, Text, ScrollView, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/types"
import { useAuth } from "../../context/AuthContext"

// Components
import { Header } from "../../components/Header"
import { ProfileInfoCard } from "../../components/ProfileInfoCard"
import { ProfileEditForm } from "../../components/ProfileEditForm"
import { PrimaryButton, DangerButton } from "../../components/Buttons"

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">
}

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { logout } = useAuth()

  // Mock data for employee profile
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    position: "Waiter",
    department: "Service",
    joinDate: "01/01/2023",
    address: "123 Main St, Anytown, USA",
    emergencyContact: "Jane Doe: +1 (555) 987-6543",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({ ...profile })

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile({ ...profile })
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    // This is where you would call your API to update the profile
    setProfile({ ...editedProfile })
    setIsEditing(false)
    Alert.alert("Success", "Profile updated successfully")
  }

  const handleChange = (field: string, value: string) => {
    setEditedProfile({ ...editedProfile, [field]: value })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="My Profile"
        onBackPress={() => navigation.goBack()}
        rightIcon={isEditing ? "x" : "edit"}
        onRightPress={isEditing ? handleCancel : handleEdit}
      />

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: "https://via.placeholder.com/150" }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profilePosition}>{profile.position}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Full Time</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!isEditing ? (
            <ProfileInfoCard profile={profile} />
          ) : (
            <ProfileEditForm profile={editedProfile} onChange={handleChange} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="briefcase" size={16} color="#666" />
                <Text style={styles.infoLabelText}>Position</Text>
              </View>
              <Text style={styles.infoValue}>{profile.position}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="users" size={16} color="#666" />
                <Text style={styles.infoLabelText}>Department</Text>
              </View>
              <Text style={styles.infoValue}>{profile.department}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="calendar" size={16} color="#666" />
                <Text style={styles.infoLabelText}>Join Date</Text>
              </View>
              <Text style={styles.infoValue}>{profile.joinDate}</Text>
            </View>
          </View>
        </View>

        {isEditing && <PrimaryButton title="Save Changes" onPress={handleSave} style={styles.saveButton} />}

        <DangerButton title="Logout" onPress={logout} icon="log-out" style={styles.logoutButton} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: "row",
  },
  badge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: 150,
  },
  infoLabelText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    textAlign: "right",
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 12,
  },
  logoutButton: {
    marginBottom: 30,
  },
})

export default ProfileScreen
