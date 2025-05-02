import React from "react"
import { StyleSheet, View, Text, Image } from "react-native"

interface EmployeeInfo {
  name: string
  position: string
  id: string
  department: string
  joinDate: string
}

interface EmployeeInfoCardProps {
  employeeInfo: EmployeeInfo
}

export const EmployeeInfoCard: React.FC<EmployeeInfoCardProps> = ({ employeeInfo }) => {
  return (
    <View style={styles.employeeInfoCard}>
      <View style={styles.employeeInfoHeader}>
        <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.employeeImage} />
        <View style={styles.employeeDetails}>
          <Text style={styles.employeeName}>{employeeInfo.name}</Text>
          <Text style={styles.employeePosition}>{employeeInfo.position}</Text>
          <View style={styles.employeeIdContainer}>
            <Text style={styles.employeeId}>ID: {employeeInfo.id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.employeeInfoDetails}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Department:</Text>
          <Text style={styles.infoValue}>{employeeInfo.department}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Join Date:</Text>
          <Text style={styles.infoValue}>{employeeInfo.joinDate}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  employeeInfoCard: {
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
  employeeInfoHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  employeeImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  employeeDetails: {
    flex: 1,
    justifyContent: "center",
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  employeePosition: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  employeeIdContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  employeeId: {
    fontSize: 14,
    color: "#666",
  },
  employeeInfoDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
})
