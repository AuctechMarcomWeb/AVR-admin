import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { blogService } from '../services/blog.service'
import { uploadService } from '../services/upload.service'

export const useBlog = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchAll = (searchVal = '', active = false, page = 1) => {
    setLoading(true)
    const params = { page, limit: 10, sortBy: 'recent', search: searchVal }
    if (active) params.isActive = active
    blogService
      .getAll(params)
      .then((res) => {
        const raw = res.data.data
        setData(raw?.blogs || raw?.data || [])
        setPagination((prev) => ({
          ...prev,
          total: raw?.totalBlogs || raw?.total || 0,
          current: page,
        }))
      })
      .catch(() => toast.error('Failed to fetch blogs'))
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
    return blogService
      .create(vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Blog added successfully')
        fetchAll(search, activeOnly, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to add blog')
        return Promise.reject(err)
      })
  }

  const updateItem = (id, vals) => {
    return blogService
      .update(id, vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Blog updated successfully')
        fetchAll(search, activeOnly, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update blog')
        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    blogService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Blog deleted successfully')
        fetchAll(search, activeOnly, pagination.current)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete blog'))
  }

  return {
    data, loading, search, activeOnly, pagination,
    handleSearch, handleActiveToggle, handlePageChange,
    addItem, updateItem, deleteItem, uploadImage,
  }
}
