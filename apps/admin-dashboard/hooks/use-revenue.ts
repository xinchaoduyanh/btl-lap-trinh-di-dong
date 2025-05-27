import { useEffect, useState } from "react"
import api from "@/lib/axios" // Đảm bảo import đúng instance axios

export function useRevenue(days = 7) {
  const [data, setData] = useState<any[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    api.get(`/orders/revenue/${days}`)
      .then((response) => {
        // response.data phải có dạng { data: [...], totalRevenue: ... }
        setData(response.data.data || [])
        setTotalRevenue(response.data.totalRevenue || 0)
      })
      .finally(() => setIsLoading(false))
  }, [days])

  return { data, totalRevenue, isLoading }
}