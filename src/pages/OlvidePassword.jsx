import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function OlvidePassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-password`
    })

    if (error) {
      setError('No se pudo enviar el correo. Verifica la dirección.')
    } else {
      setEnviado(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f7f8fc'
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '22px', fontWeight: 600, color: '#2d2d3a', letterSpacing: '-0.02em' }}>
            Snackora ERP
          </p>
          <p style={{ color: '#9999aa', marginTop: '8px', fontSize: '14px' }}>
            Recupera tu contraseña
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '36px', border: '1px solid #f0f0f5',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          {enviado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
              <p style={{ fontWeight: 500, color: '#2d2d3a', marginBottom: '8px' }}>
                Correo enviado
              </p>
              <p style={{ color: '#9999aa', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones para crear una nueva contraseña.
              </p>
              <Link to="/" style={{
                display: 'block', padding: '12px',
                background: '#0e86b6', color: 'white',
                borderRadius: '12px', textDecoration: 'none',
                fontSize: '14px', fontWeight: 500, textAlign: 'center'
              }}>
                Volver al inicio
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: '#9999aa', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tucorreo@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9999aa' }}>
                <Link to="/" style={{ color: '#0e86b6', textDecoration: 'none', fontWeight: 500 }}>
                  Volver al inicio
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}