import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState icon="🧭" title="Page not found" action={<Link to="/" className="btn btn-primary">Go home</Link>}>
        That page doesn't exist.
      </EmptyState>
    </div>
  )
}
