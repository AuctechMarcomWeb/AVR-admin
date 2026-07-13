import { getRequest, postRequest, putRequest, deleteRequest } from '../Helpers'

const BASE = 'portfolio'

export const portfolioService = {
  getAll: (params = {}) => {
    const { page = 1, limit = 10, sortBy = 'recent', activeStatus, category, featured, search } = params
    const queryObj = { page, limit, sortBy }
    if (activeStatus !== undefined && activeStatus !== null) queryObj.activeStatus = activeStatus
    if (category) queryObj.category = category
    if (featured !== undefined && featured !== null) queryObj.featured = featured
    if (search) queryObj.search = search
    const query = new URLSearchParams(queryObj).toString()
    return getRequest(`${BASE}?${query}`)
  },
  getById: (id) => getRequest(`${BASE}/${id}`),
  create: (data) => postRequest({ url: BASE, cred: data }),
  update: (id, data) => putRequest({ url: `${BASE}/${id}`, cred: data }),
  remove: (id) => deleteRequest(`${BASE}/${id}`),
}
