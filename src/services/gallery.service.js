/* eslint-disable prettier/prettier */
import { getRequest, postRequest, putRequest, deleteRequest } from '../Helpers'

const BASE = 'gallery'

export const galleryService = {
  getAll: (params = {}) => {
    const {
      page = 1,
      limit = 10,
      isActive,
      sortBy = 'recent',
      search,
      isPagination = true,
    } = params

    const queryObject = {
      page,
      limit,
      sortBy,
      isPagination,
    }

    if (isActive !== undefined && isActive !== null) {
      queryObject.isActive = isActive
    }

    if (search?.trim()) {
      queryObject.search = search.trim()
    }

    const query = new URLSearchParams(queryObject).toString()

    return getRequest(`${BASE}?${query}`)
  },

  getById: (id) => getRequest(`${BASE}/${id}`),

  create: (data) =>
    postRequest({
      url: BASE,
      cred: data,
    }),

  update: (id, data) =>
    putRequest({
      url: `${BASE}/${id}`,
      cred: data,
    }),

  remove: (id) => deleteRequest(`${BASE}/${id}`),
}
