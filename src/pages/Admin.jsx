import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Admin() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [stats, setStats] = useState({ total: 0, activos: 0, nuevosHoy: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    verificarAdmin()
  }, [])

  async function verificarAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/'); return }
    const { data: perfil } = await supabase
      .from('perfiles').select('rol').eq('id', user.id).single()
    if (perfil?.rol !== 'admin') { navigate('/dashboard'); return }
    cargar()
  }

  async function cargar() {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false })

    const hoy = new Date().toISOString().split('T')[0]
    const total = data?.length || 0
    const activos = data?.filter(u => u.activo).length || 0
    const nuevosHoy = data?.filter(u => u.created_at?.startsWith(hoy)).length || 0

    setUsuarios(data || [])
    setStats({ total, activos, nuevosHoy })
    setLoading(false)
  }

  async function toggleActivo(id, activo) {
    await supabase.from('perfiles').update({ activo: !activo }).eq('id', id)
    cargar()
  }

  async function cambiarRol(id, rolActual) {
    const nuevoRol = rolActual === 'admin' ? 'usuario' : 'admin'
    if (!confirm(`¿Cambiar rol a ${nuevoRol}?`)) return
    await supabase.from('perfiles').update({ rol: nuevoRol }).eq('id', id)
    cargar()
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.negocio?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#9999aa' }}>Cargando...</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fc' }}>

      {/* Navbar admin */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #f0f0f5',
        padding: '0 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '62px',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#2d2d3a', letterSpacing: '-0.02em' }}>
            Snackora ERP
          </span>
          <span style={{
            background: '#f0f0ff', color: '#0e86b6',
            fontSize: '11px', fontWeight: 500, padding: '3px 10px',
            borderRadius: '20px', letterSpacing: '0.04em'
          }}>
            ADMIN
          </span>
        </div>
       <button
  onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
  style={{
    background: 'none', color: '#9999aa',
    border: '1.5px solid #ebebf0', padding: '7px 16px',
    borderRadius: '10px', cursor: 'pointer',
    fontSize: '13px', fontFamily: 'Inter, sans-serif'
  }}>
  Cerrar sesión
</button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#2d2d3a', marginBottom: '24px' }}>
          Panel de administración
        </h2>

        {/* Tarjetas estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            border: '1px solid #f0f0f5', borderLeft: '4px solid #0e86b6'
          }}>
            <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Total registrados
            </p>
            <p style={{ fontSize: '36px', fontWeight: 500, color: '#0e86b6', marginTop: '8px' }}>
              {stats.total}
            </p>
          </div>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            border: '1px solid #f0f0f5', borderLeft: '4px solid #22c98a'
          }}>
            <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Cuentas activas
            </p>
            <p style={{ fontSize: '36px', fontWeight: 500, color: '#22c98a', marginTop: '8px' }}>
              {stats.activos}
            </p>
          </div>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            border: '1px solid #f0f0f5', borderLeft: '4px solid #f59e0b'
          }}>
            <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Nuevos hoy
            </p>
            <p style={{ fontSize: '36px', fontWeight: 500, color: '#f59e0b', marginTop: '8px' }}>
              {stats.nuevosHoy}
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '28px',
          border: '1px solid #f0f0f5', marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#2d2d3a' }}>
              Distribuidores registrados ({usuariosFiltrados.length})
            </h3>
            <input
              placeholder="Buscar por nombre, negocio o correo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ margin: 0, width: '300px' }}
            />
          </div>

          {loading ? (
            <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>Cargando...</p>
          ) : usuariosFiltrados.length === 0 ? (
            <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>
              No hay usuarios que coincidan
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f5' }}>Nombre</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f5' }}>Negocio</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f5' }}>Correo</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f5' }}>Registro</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f5' }}>Rol</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f5' }}>Estado</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f5' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f7f7fa' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#2d2d3a' }}>
                      {u.nombre || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#2d2d3a' }}>
                      {u.negocio || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#9999aa' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9999aa' }}>
                      {new Date(u.created_at).toLocaleDateString('es-EC', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: u.rol === 'admin' ? '#f0f0ff' : '#f7f8fc',
                        color: u.rol === 'admin' ? '#0e86b6' : '#9999aa',
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 500
                      }}>
                        {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: u.activo ? '#f0fdf8' : '#fff5f5',
                        color: u.activo ? '#22c98a' : '#ff5c5c',
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 500
                      }}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => toggleActivo(u.id, u.activo)}
                          style={{
                            background: u.activo ? '#fff5f5' : '#f0fdf8',
                            color: u.activo ? '#ff5c5c' : '#22c98a',
                            border: 'none', padding: '6px 12px',
                            borderRadius: '8px', cursor: 'pointer',
                            fontSize: '12px', fontFamily: 'Inter, sans-serif',
                            fontWeight: 500
                          }}>
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => cambiarRol(u.id, u.rol)}
                          style={{
                            background: '#f7f8fc', color: '#9999aa',
                            border: 'none', padding: '6px 12px',
                            borderRadius: '8px', cursor: 'pointer',
                            fontSize: '12px', fontFamily: 'Inter, sans-serif',
                            fontWeight: 500
                          }}>
                          {u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}