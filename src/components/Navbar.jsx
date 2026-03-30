import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/canillitas', label: 'Canillitas' },
    { to: '/ventas', label: 'Ventas' },
  ]

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #f0f0f5',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '62px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <span style={{
        fontWeight: 600, fontSize: '16px',
        color: '#2d2d3a', letterSpacing: '-0.02em'
      }}>
        Snackora ERP
      </span>

      <div style={{ display: 'flex', gap: '2px' }}>
        {links.map(item => {
          const activo = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to} style={{
              color: activo ? '#0e86b6' : '#9999aa',
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: activo ? 500 : 400,
              background: activo ? '#f0f0ff' : 'transparent',
              transition: 'all 0.15s ease'
            }}>{item.label}</Link>
          )
        })}
      </div>

      <button onClick={() => navigate('/')} style={{
        background: 'none',
        color: '#9999aa',
        border: '1.5px solid #ebebf0',
        padding: '7px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 400,
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.15s ease'
      }}>
        Salir
      </button>
    </nav>
  )
}