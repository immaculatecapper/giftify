import logo from '../assets/teammark-logo.webp'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <img src={logo} alt="Team Mark" width="130" height="40" loading="lazy" />
        <p>
          Giftify · COMP229 Web Application Development · Term Project by Team Mark
          <br />
          <span className="muted">© {new Date().getFullYear()} Mark Perez</span>
        </p>
      </div>
    </footer>
  )
}
