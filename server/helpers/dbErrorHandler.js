// Turns Mongoose / MongoDB errors into a readable message for the API response
const getUniqueErrorMessage = (err) => {
  try {
    const fieldName = Object.keys(err.keyValue || {})[0]
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists'
  } catch (ex) {
    return 'Unique field already exists'
  }
}

const getErrorMessage = (err) => {
  if (err.code === 11000 || err.code === 11001) return getUniqueErrorMessage(err)
  if (err.errors) {
    // Return the first validation message
    const first = Object.values(err.errors).find((e) => e.message)
    if (first) return first.message
  }
  if (err.name === 'CastError') return 'Invalid id'
  return err.message || 'Something went wrong'
}

export default { getErrorMessage }
