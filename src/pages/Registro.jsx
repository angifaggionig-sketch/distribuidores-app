import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Registro() {
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', confirmar: '', negocio: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleRegistro(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre,
          negocio: form.negocio
        }
      }
    })

    if (error) {
      setError('No se pudo crear la cuenta. Intenta con otro correo.')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f7f8fc'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '22px', fontWeight: 600, color: '#2d2d3a', letterSpacing: '-0.02em' }}>
            Snackora ERP
          </p>
          <p style={{ color: '#9999aa', marginTop: '8px', fontSize: '14px' }}>
            Crea tu cuenta gratis
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '36px', border: '1px solid #f0f0f5',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <form onSubmit={handleRegistro}>
            <label>Tu nombre</label>
            <input
              placeholder="Ej: María González"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
            />

            <label>Nombre de tu negocio</label>
            <input
              placeholder="Ej: Distribuidora El Sol"
              value={form.negocio}
              onChange={e => setForm({ ...form, negocio: e.target.value })}
              required
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tucorreo@gmail.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />

            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <label>Confirmar contraseña</label>
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmar}
              onChange={e => setForm({ ...form, confirmar: e.target.value })}
              required
            />

            {error && (
              <p style={{ color: '#ff5c5c', fontSize: '13px', marginBottom: '12px', marginTop: '-4px' }}>
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
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9999aa' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/" style={{ color: '#0e86b6', textDecoration: 'none', fontWeight: 500 }}>
                Ingresar
              </Link>
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9999aa', lineHeight: '1.6' }}>
          Al registrarte aceptas que tus datos serán usados para gestionar tu cuenta.
        </p>
      </div>
    </div>
  )
}