import client from './client'

export const departmentAPI = {
  // Get all departments
  getAllDepartments: () => client.get('/manager/departments'),
  
  // Get single department
  getDepartment: (id) => client.get(`/manager/departments/${id}`),
  
  // Create department
  createDepartment: (data) => client.post('/manager/departments', data),
  
  // Update department
  updateDepartment: (id, data) => client.put(`/manager/departments/${id}`, data),
  
  // Delete department
  deleteDepartment: (id) => client.delete(`/manager/departments/${id}`),
  
  // Get department stats
  getDepartmentStats: (id) => client.get(`/manager/departments/${id}/stats`),
}
