import client from './client'

export const paymentAPI = {
  initiatePayment: (data) => client.post('/payment/initiate', data),
  verifyPayment: (transactionId) => client.get(`/payment/verify/${transactionId}`),
  completePayment: (data) => client.post('/payment/complete', data),
  getReceipt: (transactionId) => client.get(`/payment/receipt/${transactionId}`),
}
