import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { contactService } from '../services/contact.service'

export const useContact = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchAll = (searchVal = '', page = 1) => {
    setLoading(true)
    const params = { page, limit: 10, search: searchVal }
    contactService
      .getAll(params)
      .then((res) => {
        const raw = res.data.data
        setData(raw?.contacts || raw?.data || [])
        setPagination((prev) => ({
          ...prev,
          total: raw?.totalContacts || raw?.total || 0,
          current: page,
        }))
      })
      .catch(() => toast.error('Failed to fetch contacts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleSearch = (val) => { setSearch(val); fetchAll(val, 1) }
  const handlePageChange = (page) => fetchAll(search, page)

  const markAsRead = (id) => {
    return contactService
      .update(id, { isRead: true })
      .then((res) => {
        toast.success('Marked as read')
        fetchAll(search, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update')
        return Promise.reject(err)
      })
  }

  const toggleRead = (id, currentStatus) => {
    return contactService
      .update(id, { isRead: !currentStatus })
      .then((res) => {
        toast.success(!currentStatus ? 'Marked as read' : 'Marked as unread')
        fetchAll(search, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update')
        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    contactService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Contact deleted successfully')
        fetchAll(search, pagination.current)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete contact'))
  }

  return {
    data, loading, search, pagination,
    handleSearch, handlePageChange,
    markAsRead, toggleRead, deleteItem,
  }
}
