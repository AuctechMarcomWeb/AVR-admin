/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { galleryService } from '../services/gallery.service'
import { uploadService } from '../services/upload.service'

export const useAVRGallery = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const fetchAll = (searchVal = '', active = false, page = 1) => {
    setLoading(true)

    const params = {
      page,
      limit: pagination.pageSize,
      sortBy: 'recent',
      search: searchVal,
      isPagination: true,
    }

    if (active) {
      params.isActive = true
    }

    galleryService
      .getAll(params)
      .then((res) => {
        const raw = res?.data?.data

        setData(raw?.gallery || raw?.galleries || raw?.data || [])

        setPagination((prev) => ({
          ...prev,
          total: raw?.totalGallery || raw?.total || 0,
          current: Number(raw?.currentPage) || page,
        }))
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to fetch gallery')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (value) => {
    setSearch(value)
    fetchAll(value, activeOnly, 1)
  }

  const handleActiveToggle = (value) => {
    setActiveOnly(value)
    fetchAll(search, value, 1)
  }

  const handlePageChange = (page) => {
    fetchAll(search, activeOnly, page)
  }

  const uploadImage = async (file) => {
    const response = await uploadService.uploadImage(file)

    const imageUrl = response?.data?.data?.imageUrl || response?.data?.imageUrl

    if (!imageUrl) {
      throw new Error('Image URL not received after upload')
    }

    return imageUrl
  }

  const addItem = (values) => {
    return galleryService
      .create(values)
      .then((res) => {
        toast.success(res?.data?.message || 'Gallery item added successfully')

        fetchAll(search, activeOnly, pagination.current)

        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to add gallery item')

        return Promise.reject(err)
      })
  }

  const updateItem = (id, values) => {
    return galleryService
      .update(id, values)
      .then((res) => {
        toast.success(res?.data?.message || 'Gallery item updated successfully')

        fetchAll(search, activeOnly, pagination.current)

        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to update gallery item')

        return Promise.reject(err)
      })
  }

  const deleteItem = (id) => {
    return galleryService
      .remove(id)
      .then((res) => {
        toast.success(res?.data?.message || 'Gallery item deleted successfully')

        const nextPage =
          data.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current

        fetchAll(search, activeOnly, nextPage)

        return res
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to delete gallery item')

        return Promise.reject(err)
      })
  }

  return {
    data,
    loading,
    search,
    activeOnly,
    pagination,
    handleSearch,
    handleActiveToggle,
    handlePageChange,
    addItem,
    updateItem,
    deleteItem,
    uploadImage,
  }
}
