import { getRequest, putRequest, deleteRequest } from '../Helpers'

const BASE = 'bookConslution'

export const bookConsultationService = {
  getAll: (params = {}) => {
    const { page = 1, limit = 10, sortBy = 'recent', status, search } = params
    const queryObj = { page, limit, sortBy }
    if (status) queryObj.status = status
    if (search) queryObj.search = search
    const query = new URLSearchParams(queryObj).toString()
    return getRequest(`${BASE}?${query}`)
  },
  getById: (id) => getRequest(`${BASE}/${id}`),
  update: (id, data) => putRequest({ url: `${BASE}/${id}`, cred: data }),
  remove: (id) => deleteRequest(`${BASE}/${id}`),
}
