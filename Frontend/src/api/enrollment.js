import client from './client'

export const enrollmentAPI = {
  getStatus: () => client.get('/enrollment/status'),
  getForm: () => client.get('/enrollment/form'),
  saveEnrollment: (data) => client.post('/enrollment/save', data),
  submitEnrollment: () => client.post('/enrollment/submit'),
  deleteEnrollment: () => client.delete('/enrollment/delete'),
}
