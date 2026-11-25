import { initials, safeUrl } from '../utils/format.js'

// Round profile picture, or the person's initials if they have no avatar link
export default function Avatar({ user, size = 44 }) {
  const src = safeUrl(user?.avatarUrl)
  const style = { width: size, height: size, fontSize: size * 0.38 }
  return src ? (
    <img className="avatar" src={src} alt={user?.name || ''} style={style} loading="lazy" />
  ) : (
    <span className="avatar avatar-initials" style={style} aria-hidden="true">
      {initials(user?.name)}
    </span>
  )
}
