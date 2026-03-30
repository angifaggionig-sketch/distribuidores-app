import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: perfil } = await supabase
        .from('perfiles').select('rol').eq('id', user.id).single()
      if (perfil?.rol === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
    setLoading(false)
  }
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f8fc'
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{
            fontSize: '22px', fontWeight: 600,
            color: '#2d2d3a', letterSpacing: '-0.02em'
          }}>
            Snackora ERP
          </p>
          <p style={{ color: '#9999aa', marginTop: '8px', fontSize: '14px' }}>
            Ingresa a tu cuenta
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '36px', border: '1px solid #f0f0f5',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <form onSubmit={handleLogin}>
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tucorreo@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && (
              <p style={{
                color: '#ff5c5c', fontSize: '13px',
                marginBottom: '16px', marginTop: '-4px'
              }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              style={{
                width: '100%', padding: '12px',
                background: '#0e86b6', color: 'white',
                border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer', marginTop: '4px',
                transition: 'all 0.18s ease'
              }}
              disabled={loading}
              
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9999aa' }}>
  ¿No tienes cuenta?{' '}
  <Link to="/registro" style={{ color: '#0e86b6', textDecoration: 'none', fontWeight: 500 }}>
    Regístrate gratis
  </Link>
  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px' }}>
  <Link to="/olvide-password" style={{ color: '#9999aa', textDecoration: 'none' }}>
    ¿Olvidaste tu contraseña?
  </Link>
</p>
</p>
          </form>
        </div>
      </div>
    </div>
  )
}