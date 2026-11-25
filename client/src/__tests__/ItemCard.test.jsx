import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ItemCard from '../components/ItemCard.jsx'

const base = { _id: 'i1', name: 'Kindle Paperwhite', price: 239, priority: 'high', url: 'https://example.com/k' }
const handlers = () => ({ onEdit: vi.fn(), onDelete: vi.fn(), onClaim: vi.fn(), onUnclaim: vi.fn(), onGiven: vi.fn() })

describe('<ItemCard />', () => {
  it('owner sees Edit / Delete and never any claim status', async () => {
    const h = handlers()
    render(<ItemCard item={base} isOwner {...h} />)
    expect(screen.getByText('Kindle Paperwhite')).toBeInTheDocument()
    expect(screen.getByText('$239.00')).toBeInTheDocument()
    expect(screen.queryByText(/claim/i)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(h.onEdit).toHaveBeenCalledWith(base)
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(h.onDelete).toHaveBeenCalled()
  })

  it('follower can claim an unclaimed gift', async () => {
    const h = handlers()
    render(<ItemCard item={{ ...base, isClaimed: false, claimedByMe: false }} {...h} />)
    await userEvent.click(screen.getByRole('button', { name: "I'll get this" }))
    expect(h.onClaim).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('follower sees "Claimed by someone" when another friend claimed it', () => {
    render(<ItemCard item={{ ...base, isClaimed: true, claimedByMe: false }} {...handlers()} />)
    expect(screen.getByText('Claimed by someone')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('the claimer can unclaim or mark the gift as given', async () => {
    const h = handlers()
    render(<ItemCard item={{ ...base, isClaimed: true, claimedByMe: true }} {...h} />)
    expect(screen.getByText("✓ You're getting this")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Unclaim' }))
    await userEvent.click(screen.getByRole('button', { name: 'Gift given' }))
    expect(h.onUnclaim).toHaveBeenCalled()
    expect(h.onGiven).toHaveBeenCalled()
  })

  it('does not render unsafe links', () => {
    render(<ItemCard item={{ ...base, url: 'javascript:alert(1)' }} isOwner {...handlers()} />)
    expect(screen.queryByText(/View product/)).not.toBeInTheDocument()
  })
})
