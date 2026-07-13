import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { galleryService } from '../services/gallery.service'
import { uploadService } from '../services/upload.service'

export const useAVRGallery = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchAll = (searchVal = '', active = false, serviceType = '', page = 1) => {
    setLoading(true)
    const params = { page, limit: 10, sortBy: 'recent', search: searchVal }
    if (active) params.isActive = true
    if (serviceType) params.serviceType = serviceType
    galleryService
      .getAll(params)
      .then((res) => {
        const raw = res.data.data
        setData(raw?.gallery || raw?.galleries || raw?.data || [])
        setPagination((prev) => ({
          ...prev,
          total: raw?.totalGallery || raw?.total || 0,
          current: page,
        }))
      })
      .catch(() => toast.error('Failed to fetch gallery'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleSearch = (val) => { setSearch(val); fetchAll(val, activeOnly, serviceTypeFilter, 1) }
  const handleActiveToggle = (val) => { setActiveOnly(val); fetchAll(search, val, serviceTypeFilter, 1) }
  const handleServiceTypeChange = (val) => { setServiceTypeFilter(val); fetchAll(search, activeOnly, val, 1) }
  const handlePageChange = (page) => fetchAll(search, activeOnly, serviceTypeFilter, page)

  const uploadImage = async (file) => {
    const res = await uploadService.uploadImage(file)
    return res.data.data.imageUrl
  }

  const addItem = (vals) => {
    return galleryService
      .create(vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Gallery item added successfully')
        fetchAll(search, activeOnly, serviceTypeFilter, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to add gallery item')
        return Promise.reject(err)
      })
  }

  const updateItem = (id, vals) => {
    return galleryService
      .update(id, vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Gallery item updated successfully')
        fetchAll(search, activeOnly, serviceTypeFilter, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update gallery item')
        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    galleryService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Gallery item deleted successfully')
        fetchAll(search, activeOnly, serviceTypeFilter, pagination.current)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete gallery item'))
  }

  return {
    data, loading, search, activeOnly, serviceTypeFilter, pagination,
    handleSearch, handleActiveToggle, handleServiceTypeChange, handlePageChange,
    addItem, updateItem, deleteItem, uploadImage,
  }
}
