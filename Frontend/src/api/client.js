import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_URL,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  
  // ALWAYS set Authorization header if token exists, regardless of request type
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('[API Client] Token found, setting Authorization header')
  } else {
    console.warn('[API Client] No token found in localStorage')
  }
  
  // Ne pas définir Content-Type pour FormData, laisser axios le faire automatiquement
  // Mais s'assurer que les autres headers sont préservés
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  // Log the request for debugging
  console.log('[API Client] Request:', {
    method: config.method,
    url: config.url,
    hasAuth: !!token,
    contentType: config.headers['Content-Type'],
    isFormData: config.data instanceof FormData,
  })
  
  return config
})

// Add response interceptor to log errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API Client] Unauthenticated error:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.response?.data?.message,
        authHeader: error.config?.headers?.Authorization,
      })
      // Clear token if it's invalid
      localStorage.removeItem('token')
      localStorage.removeItem('candidate')
    }
    return Promise.reject(error)
  }
)

export default client
