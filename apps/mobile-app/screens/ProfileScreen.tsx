"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const ProfileScreen = ({ navigation }) => {
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken")
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    } catch (error) {
      Alert.alert("Error", "Failed to log out")
    }
  }

  const handleChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={handleEdit}>
            <Feather name="edit" size={24} color="#333" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

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
          <View style={styles.infoCard}>
            {!isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.email}
                    onChangeText={(text) => handleChange("email", text)}
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.phone}
                    onChangeText={(text) => handleChange("phone", text)}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.address}
                    onChangeText={(text) => handleChange("address", text)}
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Emergency Contact</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.emergencyContact}
                    onChangeText={(text) => handleChange("emergencyContact", text)}
                  />
                </View>
              </>
            )}
          </View>
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

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#F44336",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default ProfileScreen
