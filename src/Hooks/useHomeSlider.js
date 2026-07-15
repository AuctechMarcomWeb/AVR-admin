import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { homeSliderService } from '../services/homeSlider.service'
import { uploadService } from '../services/upload.service'

export const useHomeSlider = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchAll = (searchVal = '', active = false, page = 1) => {
    setLoading(true)
    const params = { page, limit: 10, sortBy: 'recent' }
    if (active) params.isActive = true
    if (searchVal) params.search = searchVal
    homeSliderService
      .getAll(params)
      .then((res) => {
        const raw = res.data.data
        setData(raw?.sliders || raw?.homeSliders || raw?.data || [])
        setPagination((prev) => ({
          ...prev,
          total: raw?.totalSliders || raw?.total || 0,
          current: page,
        }))
      })
      .catch(() => toast.error('Failed to fetch sliders'))
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

  const addItem = async (vals) => {
    return homeSliderService
      .create(vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Slider added successfully')
        fetchAll(search, activeOnly, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to add slider')
        return Promise.reject(err)
      })
  }

  const updateItem = async (id, vals) => {
    return homeSliderService
      .update(id, vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Slider updated successfully')
        fetchAll(search, activeOnly, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update slider')
        return Promise.reject(err)
      })
  }

  const toggleStatus = (id, currentStatus) => {
    return homeSliderService
      .update(id, { isActive: !currentStatus })
      .then((res) => {
        toast.success(res?.data?.message || 'Status updated')
        fetchAll(search, activeOnly, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update status')
        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    homeSliderService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Slider deleted successfully')
        fetchAll(search, activeOnly, pagination.current)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete slider'))
  }

  return {
    data, loading, search, activeOnly, pagination,
    handleSearch, handleActiveToggle, handlePageChange,
    addItem, updateItem, deleteItem, uploadImage, toggleStatus,
  }
}
