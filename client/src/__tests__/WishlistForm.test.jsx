import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WishlistForm from '../components/WishlistForm.jsx'

describe('<WishlistForm />', () => {
  it('shows an error and does not submit without a title', async () => {
    const onSubmit = vi.fn()
    render(<WishlistForm onSubmit={onSubmit} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the entered values', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<WishlistForm onSubmit={onSubmit} onCancel={() => {}} submitLabel="Create list" />)
    await userEvent.type(screen.getByLabelText('Title'), 'Christmas 2026')
    await userEvent.selectOptions(screen.getByLabelText('Occasion'), 'christmas')
    await userEvent.type(screen.getByLabelText('Event date'), '2026-12-25')
    await userEvent.click(screen.getByRole('button', { name: 'Create list' }))
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Christmas 2026', occasion: 'christmas', eventDate: '2026-12-25', description: '' })
  })

  it('pre-fills the form when editing and shows server errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Only the owner can change this wish list'))
    render(<WishlistForm initial={{ title: 'Birthday', occasion: 'birthday', eventDate: '2027-03-14T00:00:00.000Z' }} onSubmit={onSubmit} onCancel={() => {}} />)
    expect(screen.getByLabelText('Title')).toHaveValue('Birthday')
    expect(screen.getByLabelText('Event date')).toHaveValue('2027-03-14')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Only the owner can change this wish list')).toBeInTheDocument()
  })
})
