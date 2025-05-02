import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

interface FilterButtonProps {
  title: string
  isActive: boolean
  onPress: () => void
}

export const FilterButton: React.FC<FilterButtonProps> = ({ title, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.activeFilterButton]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
