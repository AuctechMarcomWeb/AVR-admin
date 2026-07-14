import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import { blogService } from '../services/blog.service'
import { uploadService } from '../services/upload.service'

const getResponseBody = (response) => {
  return response?.data ?? response
}

const getResponseData = (response) => {
  const body = getResponseBody(response)
  return body?.data ?? body
}

const getResponseMessage = (response, fallback) => {
  const body = getResponseBody(response)
  return body?.message || fallback
}

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  )
}

const normalizePayload = (values = {}) => {
  const payload = {
    ...values,
    seoTitle: values.seoTitle?.trim(),
    isActive: values.isActive ?? true,
  }

  if (typeof values.url === 'string') {
    payload.url = values.url.trim()
  }

  if (typeof values.heading === 'string') {
    payload.heading = values.heading.trim()
  }

  if (typeof values.metaKeywords === 'string') {
    payload.metaKeywords = values.metaKeywords.trim()
  }

  if (typeof values.shortDescription === 'string') {
    payload.shortDescription =
      values.shortDescription.trim()
  }

  if (typeof values.mainImage === 'string') {
    payload.mainImage = values.mainImage.trim()
  }

  if (typeof values.mainImageName === 'string') {
    payload.mainImageName =
      values.mainImageName.trim()
  }

  if (Array.isArray(values.multipleImages)) {
    payload.multipleImages =
      values.multipleImages.filter(Boolean)
  }

  return payload
}

export const useBlog = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const searchTimerRef = useRef(null)
  const requestIdRef = useRef(0)

  const fetchAll = useCallback(
    async (
      searchValue = '',
      active = false,
      page = 1,
      pageSize = 10,
    ) => {
      const currentRequestId =
        requestIdRef.current + 1

      requestIdRef.current = currentRequestId
      setLoading(true)

      try {
        const params = {
          page,
          limit: pageSize,
          sortBy: 'recent',
          search: searchValue,
          isPagination: true,
        }

        // Checkbox off hone par active/inactive dono aayenge
        if (active) {
          params.isActive = true
        }

        const response = await blogService.getAll(params)

        // Purane request ka response ignore karo
        if (
          currentRequestId !== requestIdRef.current
        ) {
          return
        }

        const responseData =
          getResponseData(response) || {}

        const blogs = Array.isArray(responseData.blogs)
          ? responseData.blogs
          : Array.isArray(responseData.data)
            ? responseData.data
            : []

        setData(blogs)

        setPagination({
          current:
            Number(responseData.currentPage) || page,
          pageSize:
            Number(responseData.limit) || pageSize,
          total:
            Number(responseData.totalBlogs) ||
            Number(responseData.total) ||
            0,
        })
      } catch (error) {
        if (
          currentRequestId === requestIdRef.current
        ) {
          setData([])

          toast.error(
            getErrorMessage(
              error,
              'Failed to fetch blogs',
            ),
          )
        }
      } finally {
        if (
          currentRequestId === requestIdRef.current
        ) {
          setLoading(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    fetchAll('', false, 1, 10)

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [fetchAll])

  const handleSearch = (value) => {
    const nextValue = value || ''
    setSearch(nextValue)

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    searchTimerRef.current = setTimeout(() => {
      fetchAll(
        nextValue,
        activeOnly,
        1,
        pagination.pageSize,
      )
    }, 400)
  }

  const handleActiveToggle = (value) => {
    setActiveOnly(value)

    fetchAll(
      search,
      value,
      1,
      pagination.pageSize,
    )
  }

  const handlePageChange = (
    page,
    pageSize = pagination.pageSize,
  ) => {
    fetchAll(search, activeOnly, page, pageSize)
  }

  const uploadImage = async (file) => {
    try {
      const response =
        await uploadService.uploadImage(file)

      const responseData = getResponseData(response)
      const imageUrl = responseData?.imageUrl

      if (!imageUrl) {
        throw new Error(
          'Image URL not found in upload response',
        )
      }

      return imageUrl
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to upload image',
        ),
      )

      throw error
    }
  }

  const addItem = async (values) => {
    try {
      const payload = normalizePayload(values)
      const response =
        await blogService.create(payload)

      toast.success(
        getResponseMessage(
          response,
          'Blog added successfully',
        ),
      )

      await fetchAll(
        search,
        activeOnly,
        1,
        pagination.pageSize,
      )

      return response
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to add blog',
        ),
      )

      throw error
    }
  }

  const updateItem = async (id, values) => {
    try {
      const payload = normalizePayload(values)

      const response = await blogService.update(
        id,
        payload,
      )

      toast.success(
        getResponseMessage(
          response,
          'Blog updated successfully',
        ),
      )

      await fetchAll(
        search,
        activeOnly,
        pagination.current,
        pagination.pageSize,
      )

      return response
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to update blog',
        ),
      )

      throw error
    }
  }

  const deleteItem = async (id) => {
    try {
      const response =
        await blogService.remove(id)

      toast.success(
        getResponseMessage(
          response,
          'Blog deleted successfully',
        ),
      )

      // Current page par sirf ek item ho aur page > 1 ho
      // to previous page fetch karo
      const nextPage =
        data.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current

      await fetchAll(
        search,
        activeOnly,
        nextPage,
        pagination.pageSize,
      )

      return response
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to delete blog',
        ),
      )

      throw error
    }
  }

  const getBlogById = async (id) => {
    const response = await blogService.getById(id)
    return getResponseData(response)
  }

  const getBlogByUrl = async (url) => {
    const response = await blogService.getByUrl(url)
    return getResponseData(response)
  }

  return {
    data,
    loading,
    search,
    activeOnly,
    pagination,

    fetchAll,
    handleSearch,
    handleActiveToggle,
    handlePageChange,

    addItem,
    updateItem,
    deleteItem,

    getBlogById,
    getBlogByUrl,
    uploadImage,
  }
}