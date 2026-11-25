// Label + input + error message, so every form looks and behaves the same
export default function Field({ label, name, error, hint, as = 'input', children, ...props }) {
  const id = `f-${name}`
  const Tag = as
  return (
    <div className={'field' + (error ? ' has-error' : '')}>
      <label htmlFor={id}>{label}</label>
      {as === 'select' ? (
        <select id={id} name={name} aria-invalid={!!error} {...props}>
          {children}
        </select>
      ) : (
        <Tag id={id} name={name} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      )}
      {hint && !error && <small className="muted">{hint}</small>}
      {error && (
        <small className="field-error" id={`${id}-err`}>
          {error}
        </small>
      )}
    </div>
  )
}
