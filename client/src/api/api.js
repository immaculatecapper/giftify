// Every call the React app makes to the Express API, grouped by resource.
import { get, post, put, del } from './apiClient.js'

export const authApi = {
  signin: (login, password) => post('/auth/signin', { email: login, password }, { auth: false }),
  signout: () => get('/auth/signout', { auth: false }),
  me: () => get('/auth/me'),
}

export const userApi = {
  signup: (user) => post('/api/users', user, { auth: false }), // Create
  search: (q = '') => get(`/api/users?q=${encodeURIComponent(q)}`), // Read (list)
  read: (id) => get(`/api/users/${id}`), // Read (one)
  update: (id, changes) => put(`/api/users/${id}`, changes), // Update
  remove: (id) => del(`/api/users/${id}`), // Delete
  followers: (id) => get(`/api/users/${id}/followers`),
  following: (id) => get(`/api/users/${id}/following`),
  wishlists: (id) => get(`/api/users/${id}/wishlists`),
}

export const followApi = {
  request: (userId) => post('/api/follows', { userId }),
  incoming: () => get('/api/follows/requests'),
  outgoing: () => get('/api/follows/sent'),
  accept: (followId) => put(`/api/follows/${followId}/accept`),
  remove: (followId) => del(`/api/follows/${followId}`),
}

export const wishlistApi = {
  mine: () => get('/api/wishlists'),
  feed: () => get('/api/feed'),
  create: (list) => post('/api/wishlists', list),
  read: (id) => get(`/api/wishlists/${id}`),
  update: (id, changes) => put(`/api/wishlists/${id}`, changes),
  remove: (id) => del(`/api/wishlists/${id}`),
}

export const itemApi = {
  list: (wishlistId) => get(`/api/wishlists/${wishlistId}/items`),
  create: (wishlistId, item) => post(`/api/wishlists/${wishlistId}/items`, item),
  read: (id) => get(`/api/items/${id}`),
  update: (id, changes) => put(`/api/items/${id}`, changes),
  remove: (id) => del(`/api/items/${id}`),
  claim: (id) => post(`/api/items/${id}/claim`),
  unclaim: (id) => del(`/api/items/${id}/claim`),
  myClaims: () => get('/api/claims'),
}
