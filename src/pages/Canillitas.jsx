import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Canillitas() {
  const [canillitas, setCanillitas] = useState([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [canillitaSeleccionado, setCanillitaSeleccionado] = useState(null)
  const [productos, setProductos] = useState([])
  const [formProducto, setFormProducto] = useState({
    nombre: '', precio_costo: '', precio_venta: ''
  })
  const [uid, setUid] = useState(null)

  useEffect(() => {
    iniciar()
  }, [])

  async function iniciar() {
    const { data: { user } } = await supabase.auth.getUser()
    setUid(user?.id)
    cargar(user?.id)
  }

  async function cargar(userId) {
    const id = userId || uid
    const { data, error } = await supabase
      .from('canillitas')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    if (error) console.error('Error cargar:', error)
    setCanillitas(data || [])
    setLoading(false)
  }

  async function cargarProductos(canillitaId) {
    const { data, error } = await supabase
      .from('catalogo_productos')
      .select('*')
      .eq('canillita_id', canillitaId)
      .order('created_at', { ascending: true })
    if (error) console.error('Error productos:', error)
    setProductos(data || [])
  }

  async function agregar(e) {
    e.preventDefault()
    if (!nombre.trim() || !uid) return
    const { data, error } = await supabase
      .from('canillitas')
      .insert({ nombre: nombre.trim(), user_id: uid })
      .select()
    if (error) {
      console.error('Error agregar:', error)
      alert('Error al agregar: ' + error.message)
      return
    }
    setNombre('')
    cargar(uid)
  }

  async function seleccionar(c) {
    setCanillitaSeleccionado(c)
    await cargarProductos(c.id)
  }

  async function agregarProducto(e) {
    e.preventDefault()
    if (!formProducto.nombre || !formProducto.precio_costo || !formProducto.precio_venta) return
    const { error } = await supabase
      .from('catalogo_productos')
      .insert({
        canillita_id: canillitaSeleccionado.id,
        nombre: formProducto.nombre,
        precio_costo: Number(formProducto.precio_costo),
        precio_venta: Number(formProducto.precio_venta),
        user_id: uid
      })
    if (error) {
      console.error('Error producto:', error)
      alert('Error al agregar producto: ' + error.message)
      return
    }
    setFormProducto({ nombre: '', precio_costo: '', precio_venta: '' })
    cargarProductos(canillitaSeleccionado.id)
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return
    const { error } = await supabase.from('catalogo_productos').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    cargarProductos(canillitaSeleccionado.id)
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este canillita?')) return
    const { error } = await supabase.from('canillitas').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    if (canillitaSeleccionado?.id === id) setCanillitaSeleccionado(null)
    cargar(uid)
  }

  async function toggleActivo(id, activo) {
    await supabase.from('canillitas').update({ activo: !activo }).eq('id', id)
    cargar(uid)
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 500, color: '#2d2d3a' }}>
        Canillitas
      </h2>

      {/* Agregar canillita */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
          Agregar nuevo canillita
        </h3>
        <form onSubmit={agregar} style={{ display: 'flex', gap: '12px' }}>
          <input
            placeholder="Nombre del canillita"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ margin: 0 }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            + Agregar
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
        {/* Lista canillitas */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
            Lista ({canillitas.length})
          </h3>
          {loading ? (
            <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>Cargando...</p>
          ) : canillitas.length === 0 ? (
            <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>
              Aún no hay canillitas
            </p>
          ) : (
            canillitas.map(c => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', borderRadius: '10px', marginBottom: '8px',
                background: canillitaSeleccionado?.id === c.id ? '#f0f0ff' : '#f7f8fc',
                border: canillitaSeleccionado?.id === c.id ? '1.5px solid #5b5ef4' : '1.5px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }} onClick={() => seleccionar(c)}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '14px', color: '#2d2d3a' }}>{c.nombre}</p>
                  <p style={{ fontSize: '12px', color: c.activo ? '#22c98a' : '#ff5c5c', marginTop: '2px' }}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn"
                    style={{
                      background: c.activo ? '#fff5f5' : '#f0fdf8',
                      color: c.activo ? '#ff5c5c' : '#22c98a',
                      padding: '5px 10px', fontSize: '12px'
                    }}
                    onClick={e => { e.stopPropagation(); toggleActivo(c.id, c.activo) }}
                  >
                    {c.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    onClick={e => { e.stopPropagation(); eliminar(c.id) }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Productos del canillita */}
        <div className="card">
          {!canillitaSeleccionado ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9999aa' }}>
              <p style={{ fontSize: '28px' }}>👈</p>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                Selecciona un canillita para ver sus productos
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
                Productos de {canillitaSeleccionado.nombre}
              </h3>

              <form onSubmit={agregarProducto} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label>Producto</label>
                    <input
                      placeholder="Ej: Bolo verde"
                      value={formProducto.nombre}
                      onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })}
                      style={{ marginBottom: 0 }}
                      required
                    />
                  </div>
                  <div>
                    <label>Tu precio ($)</label>
                    <input
                      type="number" step="0.01" placeholder="0.10"
                      value={formProducto.precio_costo}
                      onChange={e => setFormProducto({ ...formProducto, precio_costo: e.target.value })}
                      style={{ marginBottom: 0 }}
                      required
                    />
                  </div>
                  <div>
                    <label>Precio venta ($)</label>
                    <input
                      type="number" step="0.01" placeholder="0.15"
                      value={formProducto.precio_venta}
                      onChange={e => setFormProducto({ ...formProducto, precio_venta: e.target.value })}
                      style={{ marginBottom: 0 }}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary"
                  style={{ marginTop: '10px', width: '100%' }}>
                  + Agregar producto
                </button>
              </form>

              {productos.length === 0 ? (
                <p style={{ color: '#9999aa', textAlign: 'center', padding: '16px', fontSize: '13px' }}>
                  Aún no hay productos para este canillita
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Tu precio</th>
                      <th>Venta</th>
                      <th>Ganancia</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                        <td style={{ color: '#5b5ef4' }}>${Number(p.precio_costo).toFixed(2)}</td>
                        <td style={{ color: '#22c98a' }}>${Number(p.precio_venta).toFixed(2)}</td>
                        <td style={{ fontWeight: 500, color: '#f59e0b' }}>
                          ${(Number(p.precio_venta) - Number(p.precio_costo)).toFixed(2)}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => eliminarProducto(p.id)}
                          >✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}