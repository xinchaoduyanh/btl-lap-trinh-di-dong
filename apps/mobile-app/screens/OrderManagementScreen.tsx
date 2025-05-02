import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"

const OrderManagementScreen = ({ navigation }) => {
  // Mock data for orders
  const orders = [
    {
      id: "ORD001",
      table: "Table 5",
      items: 4,
      status: "Pending",
      time: "10 mins ago",
    },
    {
      id: "ORD002",
      table: "Table 3",
      items: 2,
      status: "Preparing",
      time: "15 mins ago",
    },
    {
      id: "ORD003",
      table: "Table 8",
      items: 6,
      status: "Ready",
      time: "20 mins ago",
    },
    {
      id: "ORD004",
      table: "Table 1",
      items: 3,
      status: "Delivered",
      time: "30 mins ago",
    },
    {
      id: "ORD005",
      table: "Table 7",
      items: 5,
      status: "Completed",
      time: "45 mins ago",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FF9800"
      case "Preparing":
        return "#2196F3"
      case "Ready":
        return "#4CAF50"
      case "Delivered":
        return "#9C27B0"
      case "Completed":
        return "#666"
      default:
        return "#666"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Management</Text>
        <TouchableOpacity>
          <Feather name="plus" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>All Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Preparing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Ready</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {orders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.orderInfo}>
                <Feather name="map-pin" size={16} color="#666" />
                <Text style={styles.orderInfoText}>{order.table}</Text>
              </View>
              <View style={styles.orderInfo}>
                <Feather name="shopping-bag" size={16} color="#666" />
                <Text style={styles.orderInfoText}>{order.items} items</Text>
              </View>
              <View style={styles.orderInfo}>
                <Feather name="clock" size={16} color="#666" />
                <Text style={styles.orderInfoText}>{order.time}</Text>
              </View>
            </View>

            <View style={styles.orderActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="eye" size={16} color="#2196F3" />
                <Text style={[styles.actionText, { color: "#2196F3" }]}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Feather name="edit-2" size={16} color="#FF9800" />
                <Text style={[styles.actionText, { color: "#FF9800" }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <Text style={[styles.actionText, { color: "#4CAF50" }]}>Complete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderInfoText: {
    marginLeft: 4,
    color: "#666",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontWeight: "500",
  },
})

export default OrderManagementScreen
