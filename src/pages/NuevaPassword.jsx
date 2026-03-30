import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function NuevaPassword() {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('Mínimo 6 caracteres')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('No se pudo actualizar la contraseña')
    } else {
      setListo(true)
      setTimeout(() => navigate('/'), 3000)
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
            distribuidorapp
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '36px', border: '1px solid #f0f0f5',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          {listo ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontWeight: 500, color: '#2d2d3a', marginBottom: '8px' }}>
                Contraseña actualizada
              </p>
              <p style={{ color: '#9999aa', fontSize: '14px' }}>
                Redirigiendo al inicio...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: '#9999aa', fontSize: '14px', marginBottom: '20px' }}>
                Crea tu nueva contraseña
              </p>

              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
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
                  background: '#5b5ef4', color: 'white',
                  border: 'none', borderRadius: '12px',
                  fontSize: '14px', fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer', marginTop: '4px'
                }}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}