import { validateItem, validateSignup, validateWishlist } from '../utils/validate.js'

describe('form validation', () => {
  it('rejects an empty sign-up form', () => {
    const e = validateSignup({ name: '', username: '', email: 'bad', password: '123' })
    expect(Object.keys(e)).toEqual(['name', 'username', 'email', 'password'])
  })

  it('accepts a valid sign-up and checks the confirmation', () => {
    const ok = { name: 'Ava', username: 'ava_c', email: 'a@b.co', password: 'secret1' }
    expect(validateSignup(ok)).toEqual({})
    expect(validateSignup({ ...ok, confirm: 'other' }).confirm).toBe('Passwords do not match')
  })

  it('requires a wish list title', () => {
    expect(validateWishlist({ title: '  ' }).title).toBe('Title is required')
    expect(validateWishlist({ title: 'Birthday' })).toEqual({})
  })

  it('validates item name, price and links', () => {
    const e = validateItem({ name: '', price: '-5', url: 'shop.com' })
    expect(e.name).toBeDefined()
    expect(e.price).toBe('Price must be 0 or more')
    expect(e.url).toMatch(/http/)
    expect(validateItem({ name: 'Mixer', price: '', url: 'https://x.com' })).toEqual({})
  })
})
