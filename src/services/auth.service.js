import { postRequest, getRequest } from '../Helpers'

export const authService = {
  login: (cred) => postRequest({ url: 'auth/loginWithPassword', cred }),
  getProfile: () => getRequest('auth/profile'),
  updatePassword: (cred) => postRequest({ url: 'auth/updatePassword', cred }),
}
