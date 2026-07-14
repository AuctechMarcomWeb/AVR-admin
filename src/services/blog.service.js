import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from '../Helpers'

const BASE = 'blogs'

const createQueryString = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'recent',
    isActive,
    search,
    isPagination = true,
  } = params

  const query = new URLSearchParams()

  query.set('page', String(page))
  query.set('limit', String(limit))
  query.set('sortBy', sortBy)
  query.set('isPagination', String(isPagination))

  if (typeof isActive === 'boolean') {
    query.set('isActive', String(isActive))
  }

  if (search?.trim()) {
    query.set('search', search.trim())
  }

  return query.toString()
}

export const blogService = {
  // GET /blogs
  getAll: (params = {}) => {
    const query = createQueryString(params)
    return getRequest(`${BASE}?${query}`)
  },

  // GET /blogs/:id
  getById: (id) => {
    return getRequest(`${BASE}/${encodeURIComponent(id)}`)
  },

  // GET /blogs/url/:url
  getByUrl: (url) => {
    return getRequest(
      `${BASE}/url/${encodeURIComponent(url)}`,
    )
  },

  // POST /blogs
  create: (data) => {
    return postRequest({
      url: BASE,
      cred: data,
    })
  },

  // PUT /blogs/:id
  update: (id, data) => {
    return putRequest({
      url: `${BASE}/${encodeURIComponent(id)}`,
      cred: data,
    })
  },

  // DELETE /blogs/:id
  remove: (id) => {
    return deleteRequest(
      `${BASE}/${encodeURIComponent(id)}`,
    )
  },
}