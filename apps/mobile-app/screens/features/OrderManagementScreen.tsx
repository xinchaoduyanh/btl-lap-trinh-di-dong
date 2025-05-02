"use client"

import { useState } from "react"
import { StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/types"

// Components
import { Header } from "../../components/Header"
import { OrderCard } from "../../components/OrderCard"
import { TabBar } from "../../components/TabBar"

type OrderManagementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "OrderManagement">
}

const OrderManagementScreen = ({ navigation }: OrderManagementScreenProps) => {
  const [activeTab, setActiveTab] = useState("All Orders")

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

  const tabs = ["All Orders", "Pending", "Preparing", "Ready"]

  const filteredOrders = activeTab === "All Orders" ? orders : orders.filter((order) => order.status === activeTab)

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Order Management"
        onBackPress={() => navigation.goBack()}
        rightIcon="plus"
        onRightPress={() => {}}
      />

      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

      <ScrollView style={styles.content}>
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
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
  content: {
    flex: 1,
    padding: 16,
  },
})

export default OrderManagementScreen
