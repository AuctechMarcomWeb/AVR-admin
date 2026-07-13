import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { dashboardService } from '../services/dashboard.service'

export const useDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    dashboardService
      .getData()
      .then((res) => {
        if (res?.data?.success) {
          setData(res.data.data)
        }
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}
