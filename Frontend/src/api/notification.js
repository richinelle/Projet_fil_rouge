import client from './client'

export const notificationAPI = {
  getUnreadNotifications: () => client.get('/notifications/unread'),
  getAllNotifications: (limit = 20) => client.get('/notifications', { params: { limit } }),
  markAsRead: (notificationId) => client.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => client.put('/notifications/mark-all-read'),
  countUnreadNotifications: () => client.get('/notifications/count-unread'),
}
