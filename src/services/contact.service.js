import { getRequest, putRequest, deleteRequest } from '../Helpers'

const BASE = 'contact'

export const contactService = {
  getAll: (params = {}) => {
    const { page = 1, limit = 10, search } = params
    const queryObj = { page, limit }
    if (search) queryObj.search = search
    const query = new URLSearchParams(queryObj).toString()
    return getRequest(`${BASE}?${query}`)
  },
  getById: (id) => getRequest(`${BASE}/${id}`),
  update: (id, data) => putRequest({ url: `${BASE}/${id}`, cred: data }),
  remove: (id) => deleteRequest(`${BASE}/${id}`),
}
