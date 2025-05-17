"use client"
import React, { useState } from "react"
import { StyleSheet, ScrollView, View, Image, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "../../../context/ThemeContext"

// Components
import { Header } from "../../../components/Header"
import { OrderCard } from "../../../components/OrderCard"
import { TabBar } from "../../../components/TabBar"

export default function OrderManagementScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState("All Orders")

  // Mock data for orders
  const orders = [
    {
      id: "ORD001",
      table: "Table 5",
      items: 4,
      status: "Pending",
      time: "10 mins ago",
      details: "Seafood Hotpot, Beef Slices, Tofu, Vegetables",
    },
    {
      id: "ORD002",
      table: "Table 3",
      items: 2,
      status: "Preparing",
      time: "15 mins ago",
      details: "Spicy Hotpot, Pork Slices",
    },
    {
      id: "ORD003",
      table: "Table 8",
      items: 6,
      status: "Ready",
      time: "20 mins ago",
      details: "Mixed Hotpot, Beef Slices, Seafood, Vegetables, Noodles, Tofu",
    },
    {
      id: "ORD004",
      table: "Table 1",
      items: 3,
      status: "Delivered",
      time: "30 mins ago",
      details: "Vegetarian Hotpot, Tofu, Mushrooms",
    },
    {
      id: "ORD005",
      table: "Table 7",
      items: 5,
      status: "Completed",
      time: "45 mins ago",
      details: "Spicy Hotpot, Beef Slices, Seafood, Mushrooms, Noodles",
    },
  ]

  const tabs = ["All Orders", "Pending", "Preparing", "Ready"]

  const filteredOrders = activeTab === "All Orders" ? orders : orders.filter((order) => order.status === activeTab)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Order Management" onBackPress={() => router.back()} rightIcon="plus" onRightPress={() => {}} />

      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: "https://img.freepik.com/free-photo/hot-pot-asian-food_74190-7540.jpg" }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>ITHotpot Orders</Text>
          <Text style={styles.bannerSubtitle}>Manage all customer orders</Text>
        </View>
      </View>

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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bannerContainer: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerImage: {
    width: 100,
    height: 100,
  },
  bannerTextContainer: {
    flex: 1,
    padding: 15,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF8C00",
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
})
