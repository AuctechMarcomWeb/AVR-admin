import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { portfolioService } from '../services/portfolio.service'
import { uploadService } from '../services/upload.service'

export const usePortfolio = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchAll = (searchVal = '', active = false, category = '', page = 1) => {
    setLoading(true)
    const params = { page, limit: 10, sortBy: 'recent', search: searchVal }
    if (active) params.activeStatus = true
    if (category) params.category = category
    portfolioService
      .getAll(params)
      .then((res) => {
        const raw = res.data.data
        setData(raw?.portfolios || raw?.portfolio || raw?.data || [])
        setPagination((prev) => ({
          ...prev,
          total: raw?.totalPortfolios || raw?.total || 0,
          current: page,
        }))
      })
      .catch(() => toast.error('Failed to fetch portfolios'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleSearch = (val) => { setSearch(val); fetchAll(val, activeOnly, categoryFilter, 1) }
  const handleActiveToggle = (val) => { setActiveOnly(val); fetchAll(search, val, categoryFilter, 1) }
  const handleCategoryChange = (val) => { setCategoryFilter(val); fetchAll(search, activeOnly, val, 1) }
  const handlePageChange = (page) => fetchAll(search, activeOnly, categoryFilter, page)

  const uploadImage = async (file) => {
    const res = await uploadService.uploadImage(file)
    return res.data.data.imageUrl
  }

  const addItem = (vals) => {
    return portfolioService
      .create(vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Portfolio added successfully')
        fetchAll(search, activeOnly, categoryFilter, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to add portfolio')
        return Promise.reject(err)
      })
  }

  const updateItem = (id, vals) => {
    return portfolioService
      .update(id, vals)
      .then((res) => {
        toast.success(res?.data?.message || 'Portfolio updated successfully')
        fetchAll(search, activeOnly, categoryFilter, pagination.current)
        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update portfolio')
        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    portfolioService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Portfolio deleted successfully')
        fetchAll(search, activeOnly, categoryFilter, pagination.current)
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete portfolio'))
  }

  return {
    data, loading, search, activeOnly, categoryFilter, pagination,
    handleSearch, handleActiveToggle, handleCategoryChange, handlePageChange,
    addItem, updateItem, deleteItem, uploadImage,
  }
}
