import client from './client'

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  verifyEmail: (data) => client.post('/auth/verify-email', data),
  logout: () => client.post('/auth/logout'),
}
