import { getRequest, postRequest, putRequest, deleteRequest } from '../Helpers'

const BASE = 'gallery'

export const galleryService = {
  getAll: (params = {}) => {
    const { page = 1, limit = 10, isActive, sortBy = 'recent', serviceType, search } = params
    const queryObj = { page, limit, sortBy }
    if (isActive !== undefined && isActive !== null) queryObj.isActive = isActive
    if (serviceType) queryObj.serviceType = serviceType
    if (search) queryObj.search = search
    const query = new URLSearchParams(queryObj).toString()
    return getRequest(`${BASE}?${query}`)
  },
  getById: (id) => getRequest(`${BASE}/${id}`),
  create: (data) => postRequest({ url: BASE, cred: data }),
  update: (id, data) => putRequest({ url: `${BASE}/${id}`, cred: data }),
  remove: (id) => deleteRequest(`${BASE}/${id}`),
}
