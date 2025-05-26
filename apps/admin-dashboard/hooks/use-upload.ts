import { useState } from "react"
import api from "@/lib/axios"

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data.url
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadImage,
    isUploading,
    error,
  }
}
