import { useState } from 'react'
import Field from './Field.jsx'
import { validateItem } from '../utils/validate.js'

// Create / edit form for a gift item on a wish list.
export default function ItemForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState({
    name: initial.name || '',
    price: initial.price ?? '',
    priority: initial.priority || 'medium',
    url: initial.url || '',
    imageUrl: initial.imageUrl || '',
    notes: initial.notes || '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const found = validateItem(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    setServerError('')
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        price: values.price === '' ? undefined : Number(values.price),
      })
    } catch (err) {
      setServerError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {serverError && <p className="field-error">{serverError}</p>}
      <Field label="Item name" name="name" value={values.name} onChange={change} error={errors.name} placeholder="Kindle Paperwhite" maxLength={150} />
      <div className="grid-2">
        <Field label="Price (CAD)" name="price" type="number" min="0" step="0.01" value={values.price} onChange={change} error={errors.price} placeholder="239" />
        <Field label="Priority" name="priority" as="select" value={values.priority} onChange={change}>
          <option value="high">High – really want it</option>
          <option value="medium">Medium</option>
          <option value="low">Low – nice to have</option>
        </Field>
      </div>
      <Field label="Link to the product" name="url" type="url" value={values.url} onChange={change} error={errors.url} placeholder="https://…" />
      <Field label="Image link" name="imageUrl" type="url" value={values.imageUrl} onChange={change} error={errors.imageUrl} placeholder="https://…/photo.jpg" />
      <Field label="Notes" name="notes" as="textarea" rows={2} value={values.notes} onChange={change} placeholder="Size, colour, model…" maxLength={500} />
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
