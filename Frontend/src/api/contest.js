import client from './client'

export const contestAPI = {
  listContests: () => client.get('/contests'),
  getContestDetails: (contestId) => client.get(`/contests/${contestId}`),
  registerForContest: (contestId) => client.post(`/contests/${contestId}/register`),
  getMyCandidateContests: () => client.get('/my-contests'),
  unregisterFromContest: (contestId) => client.delete(`/contests/${contestId}/unregister`),
}
