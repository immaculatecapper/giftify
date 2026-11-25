import { screen, waitFor } from '@testing-library/react'
import Navbar from '../components/Navbar.jsx'
import { ava, mockFetch, renderWithProviders } from './testUtils.jsx'

describe('<Navbar />', () => {
  it('shows Sign In and Sign Up to visitors', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.queryByText('My Profile')).not.toBeInTheDocument()
  })

  it('shows the signed-in menu, My Profile and Sign Out', async () => {
    mockFetch({ 'GET /api/follows/requests': [200, []] })
    renderWithProviders(<Navbar />, { user: ava })
    for (const name of ['Home', 'My Lists', 'Friends', 'Requests', 'My Gifts', 'My Profile']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    expect(screen.getByText('@ava')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument() // not an admin
  })

  it('marks the current page as active', () => {
    mockFetch({ 'GET /api/follows/requests': [200, []] })
    renderWithProviders(<Navbar />, { user: ava, route: '/gifts' })
    const current = screen.getByRole('link', { name: 'My Gifts' })
    expect(current).toHaveClass('active')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'My Lists' })).not.toHaveClass('active')
  })

  it('shows a badge with the number of pending follow requests', async () => {
    mockFetch({ 'GET /api/follows/requests': [200, [{ _id: 'f1' }, { _id: 'f2' }]] })
    renderWithProviders(<Navbar />, { user: ava })
    await waitFor(() => expect(screen.getByLabelText('2 pending')).toBeInTheDocument())
  })

  it('shows the Users link to admins', () => {
    mockFetch({ 'GET /api/follows/requests': [200, []] })
    renderWithProviders(<Navbar />, { user: { ...ava, role: 'admin' } })
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
  })
})
