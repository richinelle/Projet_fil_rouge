import client from './client'

export const filiereAPI = {
  // Get all filieres
  getAllFilieres: () => client.get('/manager/filieres'),
  
  // Get single filiere
  getFiliere: (id) => client.get(`/manager/filieres/${id}`),
  
  // Create filiere
  createFiliere: (data) => client.post('/manager/filieres', data),
  
  // Update filiere
  updateFiliere: (id, data) => client.put(`/manager/filieres/${id}`, data),
  
  // Delete filiere
  deleteFiliere: (id) => client.delete(`/manager/filieres/${id}`),
  
  // Get filieres by department
  getFilieresByDepartment: (departmentId) => client.get(`/manager/filieres/by-department/${departmentId}`),
  
  // Get filiere stats
  getFiliereStats: (id) => client.get(`/manager/filieres/${id}/stats`),
}
