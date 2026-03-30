import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Catalogo() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nombre: '', precio_costo: '', precio_venta: '' })
  const [editando, setEditando] = useState(null)
  const [uid, setUid] = useState(null)

  useEffect(() => { iniciar() }, [])

  async function iniciar() {
    const { data: { user } } = await supabase.auth.getUser()
    setUid(user?.id)
    cargar(user?.id)
  }

  async function cargar(userId) {
    const id = userId || uid
    const { data, error } = await supabase
      .from('catalogo_productos')
      .select('*')
      .eq('user_id', id)
      .order('nombre', { ascending: true })
    if (error) console.error('Error cargar:', error)
    setProductos(data || [])
    setLoading(false)
  }

  async function guardar(e) {
    e.preventDefault()
    if (!uid) return

    if (editando) {
      const { error } = await supabase
        .from('catalogo_productos')
        .update({
          nombre: form.nombre,
          precio_costo: Number(form.precio_costo),
          precio_venta: Number(form.precio_venta)
        })
        .eq('id', editando)
        .eq('user_id', uid)
      if (error) { alert('Error al editar: ' + error.message); return }
      setEditando(null)
    } else {
      const { error } = await supabase
        .from('catalogo_productos')
        .insert({
          nombre: form.nombre,
          precio_costo: Number(form.precio_costo),
          precio_venta: Number(form.precio_venta),
          user_id: uid
        })
      if (error) { alert('Error al agregar: ' + error.message); return }
    }
    setForm({ nombre: '', precio_costo: '', precio_venta: '' })
    cargar(uid)
  }

  function editar(p) {
    setEditando(p.id)
    setForm({ nombre: p.nombre, precio_costo: p.precio_costo, precio_venta: p.precio_venta })
  }

  async function toggleActivo(id, activo) {
    const { error } = await supabase
      .from('catalogo_productos')
      .update({ activo: !activo })
      .eq('id', id)
      .eq('user_id', uid)
    if (error) { alert('Error: ' + error.message); return }
    cargar(uid)
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este producto del catálogo?')) return
    const { error } = await supabase
      .from('catalogo_productos')
      .delete()
      .eq('id', id)
      .eq('user_id', uid)
    if (error) { alert('Error al eliminar: ' + error.message); return }
    cargar(uid)
  }

  const gananciaUnitaria = () => {
    const c = Number(form.precio_costo)
    const v = Number(form.precio_venta)
    if (!c || !v) return null
    return (v - c).toFixed(2)
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 500, color: '#2d2d3a' }}>
        Catálogo de productos
      </h2>
      <p style={{ color: '#9999aa', fontSize: '14px', marginBottom: '24px' }}>
        Registra aquí todos tus productos con sus precios. Se usarán automáticamente al registrar ventas.
      </p>

      {/* Formulario */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
          {editando ? 'Editar producto' : 'Agregar nuevo producto'}
        </h3>
        <form onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label>Nombre del producto</label>
              <input
                placeholder="Ej: Bolo verde, Popetas, Vive100..."
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Tu precio (costo $)</label>
              <input
                type="number" step="0.01" placeholder="0.10"
                value={form.precio_costo}
                onChange={e => setForm({ ...form, precio_costo: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Precio de venta ($)</label>
              <input
                type="number" step="0.01" placeholder="0.15"
                value={form.precio_venta}
                onChange={e => setForm({ ...form, precio_venta: e.target.value })}
                required
              />
            </div>
          </div>

          {gananciaUnitaria() && (
            <div style={{
              background: '#f0fdf8', border: '1px solid #22c98a',
              borderRadius: '10px', padding: '10px 16px',
              marginBottom: '12px', display: 'flex', gap: '24px'
            }}>
              <span style={{ fontSize: '13px', color: '#16a34a' }}>
                Tu ganancia por unidad:
                <strong style={{ marginLeft: '6px', fontSize: '15px' }}>
                  ${gananciaUnitaria()}
                </strong>
              </span>
              {form.precio_costo && form.precio_venta && (
                <span style={{ fontSize: '13px', color: '#9999aa' }}>
                  Margen: {(((Number(form.precio_venta) - Number(form.precio_costo)) / Number(form.precio_venta)) * 100).toFixed(0)}%
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">
              {editando ? 'Guardar cambios' : '+ Agregar producto'}
            </button>
            {editando && (
              <button type="button" className="btn"
                style={{ background: '#f7f8fc', color: '#9999aa' }}
                onClick={() => { setEditando(null); setForm({ nombre: '', precio_costo: '', precio_venta: '' }) }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
          Productos registrados ({productos.filter(p => p.activo).length} activos)
        </h3>
        {loading ? (
          <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>Cargando...</p>
        ) : productos.length === 0 ? (
          <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>
            Aún no hay productos en el catálogo
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tu precio</th>
                <th>Precio venta</th>
                <th>Tu ganancia</th>
                <th>Margen</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => {
                const ganancia = Number(p.precio_venta) - Number(p.precio_costo)
                const margen = ((ganancia / Number(p.precio_venta)) * 100).toFixed(0)
                return (
                  <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                    <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                    <td style={{ color: '#5b5ef4' }}>${Number(p.precio_costo).toFixed(2)}</td>
                    <td style={{ color: '#22c98a' }}>${Number(p.precio_venta).toFixed(2)}</td>
                    <td style={{ fontWeight: 500, color: '#f59e0b' }}>${ganancia.toFixed(2)}</td>
                    <td>
                      <span style={{
                        background: '#fef9c3', color: '#854d0e',
                        padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 500
                      }}>
                        {margen}%
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: p.activo ? '#f0fdf8' : '#fff5f5',
                        color: p.activo ? '#22c98a' : '#ff5c5c',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500
                      }}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn"
                        style={{ background: '#f0f0ff', color: '#5b5ef4', padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => editar(p)}>
                        Editar
                      </button>
                      <button className="btn"
                        style={{
                          background: p.activo ? '#fff5f5' : '#f0fdf8',
                          color: p.activo ? '#ff5c5c' : '#22c98a',
                          padding: '5px 10px', fontSize: '12px'
                        }}
                        onClick={() => toggleActivo(p.id, p.activo)}>
                        {p.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => eliminar(p.id)}>
                        X
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}