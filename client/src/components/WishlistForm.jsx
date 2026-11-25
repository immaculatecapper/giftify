import { useState } from 'react'
import Field from './Field.jsx'
import { OCCASIONS, toDateInput } from '../utils/format.js'
import { validateWishlist } from '../utils/validate.js'

// Create / edit form for a wish list (controlled inputs).
export default function WishlistForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState({
    title: initial.title || '',
    occasion: initial.occasion || 'birthday',
    eventDate: toDateInput(initial.eventDate),
    description: initial.description || '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const found = validateWishlist(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    setServerError('')
    try {
      await onSubmit({ ...values, title: values.title.trim(), eventDate: values.eventDate || null })
    } catch (err) {
      setServerError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {serverError && <p className="field-error">{serverError}</p>}
      <Field label="Title" name="title" value={values.title} onChange={change} error={errors.title} placeholder="Birthday 2027" maxLength={100} />
      <div className="grid-2">
        <Field label="Occasion" name="occasion" as="select" value={values.occasion} onChange={change}>
          {OCCASIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.emoji} {o.label}
            </option>
          ))}
        </Field>
        <Field label="Event date" name="eventDate" type="date" value={values.eventDate} onChange={change} />
      </div>
      <Field
        label="Description"
        name="description"
        as="textarea"
        rows={3}
        value={values.description}
        onChange={change}
        error={errors.description}
        placeholder="Anything your friends should know?"
        maxLength={500}
      />
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
