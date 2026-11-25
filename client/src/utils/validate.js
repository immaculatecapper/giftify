// Client-side validation that mirrors the Mongoose rules, so users get instant feedback.
// The server still validates everything.

export function validateSignup(v) {
  const e = {}
  if (!v.name?.trim()) e.name = 'Name is required'
  if (!/^[a-z0-9_.]{3,30}$/i.test(v.username || '')) e.username = 'Username must be 3-30 characters: letters, numbers, _ or .'
  if (!/.+@.+\..+/.test(v.email || '')) e.email = 'Please enter a valid email address'
  if (!v.password || v.password.length < 6) e.password = 'Password must be at least 6 characters'
  if (v.confirm !== undefined && v.confirm !== v.password) e.confirm = 'Passwords do not match'
  return e
}

export function validateProfile(v) {
  const e = validateSignup({ ...v, password: v.password || 'unchanged' })
  if (v.password && v.password.length < 6) e.password = 'Password must be at least 6 characters'
  if (v.bio && v.bio.length > 280) e.bio = 'Bio must be 280 characters or less'
  return e
}

export function validateWishlist(v) {
  const e = {}
  if (!v.title?.trim()) e.title = 'Title is required'
  else if (v.title.length > 100) e.title = 'Title must be 100 characters or less'
  if (v.description && v.description.length > 500) e.description = 'Description must be 500 characters or less'
  return e
}

export function validateItem(v) {
  const e = {}
  if (!v.name?.trim()) e.name = 'Item name is required'
  if (v.price !== '' && v.price !== undefined && (Number.isNaN(Number(v.price)) || Number(v.price) < 0))
    e.price = 'Price must be 0 or more'
  if (v.url && !/^https?:\/\//i.test(v.url)) e.url = 'Link must start with http:// or https://'
  if (v.imageUrl && !/^https?:\/\//i.test(v.imageUrl)) e.imageUrl = 'Image link must start with http:// or https://'
  return e
}
