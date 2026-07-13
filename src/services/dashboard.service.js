import { getRequest } from '../Helpers'

export const dashboardService = {
  getData: () => getRequest('dashboard'),
}
