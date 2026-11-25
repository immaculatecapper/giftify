import { countdown, daysUntil, formatDate, formatPrice, initials, occasionOf, plural, safeUrl, toDateInput } from '../utils/format.js'

describe('format helpers', () => {
  it('formats dates in UTC so they never shift a day', () => {
    expect(formatDate('2027-03-14T00:00:00.000Z')).toBe('Mar 14, 2027')
    expect(formatDate(null)).toBe('')
    expect(toDateInput('2027-03-14T00:00:00.000Z')).toBe('2027-03-14')
  })

  it('formats prices as Canadian dollars', () => {
    expect(formatPrice(239)).toBe('$239.00')
    expect(formatPrice('')).toBe('')
  })

  it('counts down to an event', () => {
    const now = new Date(2026, 11, 20) // Dec 20 2026
    expect(daysUntil('2026-12-25T00:00:00.000Z', now)).toBe(5)
    expect(countdown('2026-12-20T00:00:00.000Z', now)).toBe('Today!')
    expect(countdown('2026-12-21T00:00:00.000Z', now)).toBe('Tomorrow')
    expect(countdown('2026-12-01T00:00:00.000Z', now)).toBe('Passed')
  })

  it('looks up occasions and falls back to "Other"', () => {
    expect(occasionOf('christmas').label).toBe('Christmas')
    expect(occasionOf('nope').value).toBe('other')
  })

  it('builds initials, plurals and safe links', () => {
    expect(initials('Ava Chen')).toBe('AC')
    expect(plural(1, 'item')).toBe('1 item')
    expect(plural(3, 'item')).toBe('3 items')
    expect(safeUrl('javascript:alert(1)')).toBe('')
    expect(safeUrl('https://shop.com/x')).toBe('https://shop.com/x')
  })
})
