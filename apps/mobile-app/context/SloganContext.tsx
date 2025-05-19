"use client"

import React, { createContext, useState, useContext } from "react"
import { Alert } from "react-native"
import { config } from '../config/env'

// Define the Slogan data type
export interface Slogan {
  id: string
  content: string
  createdAt: string
  isVisible?: boolean // Added isVisible property, optional as it may not need to be displayed in UI
}

// Định nghĩa kiểu dữ liệu cho context
type SloganContextType = {
  slogan: Slogan | null
  loading: boolean
  error: string | null
  fetchRandomSlogan: () => Promise<void>
  fetchAllSlogans: () => Promise<Slogan[]>
}

// Tạo context với giá trị mặc định
const SloganContext = createContext<SloganContextType>({
  slogan: null,
  loading: false,
  error: null,
  fetchRandomSlogan: async () => {},
  fetchAllSlogans: async () => [],
})

// Hook để sử dụng context
export const useSlogan = () => useContext(SloganContext)

// Provider component
export const SloganProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slogan, setSlogan] = useState<Slogan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lấy một slogan ngẫu nhiên khi người dùng bấm vào
  const fetchRandomSlogan = async () => {
    // Nếu đang loading, không làm gì cả để tránh gọi API nhiều lần
    if (loading) return;

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching visible slogans from:', `${config.API_URL}/slogans/visible`)
      const response = await fetch(`${config.API_URL}/slogans/visible`)

      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText)
        throw new Error(`Không thể lấy slogan: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Slogan data received:', data)

      if (Array.isArray(data) && data.length > 0) {
        // Kiểm tra xem dữ liệu có đúng định dạng không
        const validSlogans = data.filter(item =>
          item && typeof item === 'object' &&
          'id' in item &&
          'content' in item &&
          typeof item.content === 'string'
        )

        if (validSlogans.length > 0) {
          // Chọn một slogan ngẫu nhiên từ danh sách
          const randomIndex = Math.floor(Math.random() * validSlogans.length)
          setSlogan(validSlogans[randomIndex])
        } else {
          console.error('No valid slogans found in data')
          setSlogan(null)
          setError('Không tìm thấy slogan hợp lệ')
        }
      } else {
        console.error('Data is not an array or is empty:', data)
        setSlogan(null)
        setError('Không có slogan nào')
      }
    } catch (err) {
      console.error('Error fetching slogan:', err)
      setError(`Không thể lấy slogan: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`)
    } finally {
      setLoading(false)
    }
  }

  // Lấy tất cả slogan
  const fetchAllSlogans = async (): Promise<Slogan[]> => {
    setLoading(true)
    setError(null)

    try {
      console.log('Fetching all slogans from:', `${config.API_URL}/slogans`)
      const response = await fetch(`${config.API_URL}/slogans`)

      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText)
        throw new Error(`Không thể lấy danh sách slogan: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('All slogans data received:', data)

      if (Array.isArray(data)) {
        // Kiểm tra và lọc các slogan hợp lệ
        const validSlogans = data.filter(item =>
          item && typeof item === 'object' &&
          'id' in item &&
          'content' in item &&
          typeof item.content === 'string'
        )

        if (validSlogans.length === 0 && data.length > 0) {
          console.error('No valid slogans found in data')
          setError('Không tìm thấy slogan hợp lệ')
        }

        return validSlogans
      } else {
        console.error('Data is not an array:', data)
        setError('Dữ liệu không đúng định dạng')
        return []
      }
    } catch (err) {
      console.error('Error fetching all slogans:', err)
      setError(`Không thể lấy danh sách slogan: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Không tự động lấy slogan khi component được mount nữa
  // Người dùng sẽ cần bấm vào để xem slogan

  return (
    <SloganContext.Provider
      value={{
        slogan,
        loading,
        error,
        fetchRandomSlogan,
        fetchAllSlogans
      }}
    >
      {children}
    </SloganContext.Provider>
  )
}
