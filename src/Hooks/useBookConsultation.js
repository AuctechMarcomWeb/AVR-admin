import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { bookConsultationService } from '../services/bookConsultation.service'

export const useBookConsultation = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchAll = (searchVal = '', status = '', page = 1) => {
    setLoading(true)
    const params = { page, limit: 10, sortBy: 'recent', search: searchVal }
    if (status) params.status = status
    bookConsultationService
      .getAll(params)
      .then((res) => {
        const raw = res.data.data
        setData(raw?.bookings || raw?.consultations || raw?.data || [])
        setPagination((prev) => ({
          ...prev,
          total: raw?.totalBookings || raw?.total || 0,
          current: page,
        }))
      })
      .catch(() => toast.error('Failed to fetch bookings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleSearch = (val) => { setSearch(val); fetchAll(val, statusFilter, 1) }
  const handleStatusChange = (val) => { setStatusFilter(val); fetchAll(search, val, 1) }
  const handlePageChange = (page) => fetchAll(search, statusFilter, page)

  const updateStatus = (id, status) => {
    return bookConsultationService
      .update(id, { status })
      .then((res) => {
        toast.success(res?.data?.message || 'Status updated successfully')
        fetchAll(search, statusFilter, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update status')
        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    bookConsultationService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Booking deleted successfully')
        fetchAll(search, statusFilter, pagination.current)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete booking'))
  }

  return {
    data, loading, search, statusFilter, pagination,
    handleSearch, handleStatusChange, handlePageChange,
    updateStatus, deleteItem,
  }
}
