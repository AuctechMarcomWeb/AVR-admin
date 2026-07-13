import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { testimonialService } from '../services/testimonial.service'
import { uploadService } from '../services/upload.service'

export const useTestimonial = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchAll = (searchVal = '', active = false, page = 1) => {
    setLoading(true)
    const params = { page, limit: 10, sortBy: 'recent', search: searchVal }
    if (active) params.isActive = true
    testimonialService
      .getAll(params)
      .then((res) => {
        const raw = res.data.data
        setData(raw?.testimonials || raw?.data || [])
        setPagination((prev) => ({
          ...prev,
          total: raw?.totalTestimonials || raw?.total || 0,
          current: page,
        }))
      })
      .catch(() => toast.error('Failed to fetch testimonials'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleSearch = (val) => { setSearch(val); fetchAll(val, activeOnly, 1) }
  const handleActiveToggle = (val) => { setActiveOnly(val); fetchAll(search, val, 1) }
  const handlePageChange = (page) => fetchAll(search, activeOnly, page)

  const uploadImage = async (file) => {
    const res = await uploadService.uploadImage(file)
    return res.data.data.imageUrl
  }

  const addItem = (vals) => {
    return testimonialService
      .create(vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Testimonial added successfully')
        fetchAll(search, activeOnly, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to add testimonial')
        return Promise.reject(err)
      })
  }

  const updateItem = (id, vals) => {
    return testimonialService
      .update(id, vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Testimonial updated successfully')
        fetchAll(search, activeOnly, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update testimonial')
        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    testimonialService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Testimonial deleted successfully')
        fetchAll(search, activeOnly, pagination.current)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete testimonial'))
  }

  return {
    data, loading, search, activeOnly, pagination,
    handleSearch, handleActiveToggle, handlePageChange,
    addItem, updateItem, deleteItem, uploadImage,
  }
}
