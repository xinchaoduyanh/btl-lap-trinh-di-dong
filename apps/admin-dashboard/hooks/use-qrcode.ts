import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/axios'
import QRCode from 'qrcode'

interface QRCode {
  id: string
  code: string
  validUntil: string
  location?: string
  isUsed: boolean
  createdAt: string
  updatedAt: string
}

export function useQRCode() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(false)

  const fetchQRCodes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/checkout/qr-code')

      // Filter out QR codes with invalid validUntil dates or expired dates
      const validQRCodes = response.data.filter((qrCode: QRCode) => {
        if (!qrCode.validUntil) return false

        try {
          const validUntilDate = new Date(qrCode.validUntil)
          const now = new Date()

          // Check if date is valid and not expired
          return !isNaN(validUntilDate.getTime()) && validUntilDate > now
        } catch (error) {
          console.error(`Invalid validUntil date for QR code ${qrCode.id}:`, error)
          return false
        }
      })

      // Sort QR codes by validUntil date (descending - latest first)
      validQRCodes.sort(
        (a: { validUntil: string | number | Date }, b: { validUntil: string | number | Date }) => {
          const dateA = new Date(a.validUntil)
          const dateB = new Date(b.validUntil)
          return -dateB.getTime() + dateA.getTime()
        }
      )

      setQRCodes(validQRCodes)
    } catch (error) {
      console.error('Failed to fetch QR codes:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const generateQRCode = useCallback(async (validUntil: string, location?: string) => {
    try {
      // Validate that validUntil is in the future
      const validUntilDate = new Date(validUntil)
      const now = new Date()

      if (isNaN(validUntilDate.getTime()) || validUntilDate <= now) {
        throw new Error('Valid until date must be in the future')
      }

      setLoading(true)
      const response = await api.post('/checkout/qr-code', {
        validUntil,
        location,
      })

      // Only add to state if it's valid
      if (validUntilDate > now) {
        setQRCodes((prev) => [...prev, response.data])
      }

      return response.data
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleQRCodeStatus = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await api.post(`/checkout/qr-code/${id}/toggle`)
      setQRCodes((prev) => prev.map((qr) => (qr.id === id ? { ...qr, isUsed: !qr.isUsed } : qr)))
      return response.data
    } catch (error) {
      console.error('Failed to toggle QR code status:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const generateQRCodeImage = useCallback(async (code: string) => {
    try {
      // Create URL for QR code
      const qrCodeUrl = `${window.location.origin}/checkout/check-in?code=${code}`

      // Generate QR code image
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      return qrCodeDataUrl
    } catch (error) {
      console.error('Failed to generate QR code image:', error)
      throw error
    }
  }, [])

  const deleteQRCode = useCallback(async (id: string) => {
    try {
      setLoading(true)
      await api.delete(`/checkout/qr-code/${id}`)
      setQRCodes((prev) => prev.filter((qr) => qr.id !== id))
      return true
    } catch (error) {
      console.error('Failed to delete QR code:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch QR codes on mount
  useEffect(() => {
    fetchQRCodes()
  }, [fetchQRCodes])

  return {
    qrCodes,
    loading,
    fetchQRCodes,
    generateQRCode,
    toggleQRCodeStatus,
    generateQRCodeImage,
    deleteQRCode,
  }
}
