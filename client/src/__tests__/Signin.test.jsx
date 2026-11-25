import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import Signin from '../pages/Signin.jsx'
import { loadSession } from '../auth/session.js'
import { ava, mockFetch, renderWithProviders } from './testUtils.jsx'

const app = (
  <Routes>
    <Route path="/signin" element={<Signin />} />
    <Route path="/" element={<h1>Home page</h1>} />
  </Routes>
)

describe('<Signin /> page', () => {
  it('asks for both fields', async () => {
    renderWithProviders(app, { route: '/signin' })
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email (or username) and password.')
  })

  it("shows the server's error for a wrong password", async () => {
    mockFetch({ 'POST /auth/signin': [401, { error: "Email and password don't match." }] })
    renderWithProviders(app, { route: '/signin' })
    await userEvent.type(screen.getByLabelText('Email or username'), 'ava')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Email and password don't match.")
  })

  it('stores the JWT and goes home after a successful sign in', async () => {
    const calls = mockFetch({ 'POST /auth/signin': [200, { token: 'jwt123', user: ava }] })
    renderWithProviders(app, { route: '/signin' })
    await userEvent.type(screen.getByLabelText('Email or username'), 'ava@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(await screen.findByText('Home page')).toBeInTheDocument()
    expect(calls[0].body).toEqual({ email: 'ava@example.com', password: 'Password1' })
    expect(loadSession()).toEqual({ token: 'jwt123', user: ava })
  })
})
