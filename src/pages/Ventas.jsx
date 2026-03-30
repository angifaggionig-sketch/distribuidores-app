import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [canillitas, setCanillitas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoVenta, setEditandoVenta] = useState(null)
  const [canillitaId, setCanillitaId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [lineas, setLineas] = useState([])
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroCanillita, setFiltroCanillita] = useState('')

  useEffect(() => { cargarTodo() }, [])
  useEffect(() => { cargarVentas() }, [filtroFechaDesde, filtroFechaHasta, filtroCanillita])

  async function cargarTodo() {
    const { data: { user } } = await supabase.auth.getUser()
    const uid = user?.id
    const { data: c } = await supabase
      .from('canillitas').select('*')
      .eq('activo', true)
      .eq('user_id', uid)
      .order('nombre')
    const { data: cat } = await supabase
      .from('catalogo_productos').select('*')
      .eq('activo', true)
      .eq('user_id', uid)
      .order('nombre')
    setCanillitas(c || [])
    setCatalogo(cat || [])
    await cargarVentas()
  }

  async function cargarVentas() {
    const { data: { user } } = await supabase.auth.getUser()
    setLoading(true)
    let query = supabase
      .from('ventas')
      .select('*, canillitas(nombre)')
      .eq('user_id', user?.id)
      .order('fecha', { ascending: false })
    if (filtroFechaDesde) query = query.gte('fecha', filtroFechaDesde)
    if (filtroFechaHasta) query = query.lte('fecha', filtroFechaHasta)
    if (filtroCanillita) query = query.eq('canillita_id', filtroCanillita)
    const { data: v } = await query
    setVentas(v || [])
    setLoading(false)
  }

  async function cargarVentas() {
    setLoading(true)
    let query = supabase
      .from('ventas')
      .select('*, canillitas(nombre)')
      .order('fecha', { ascending: false })
    if (filtroFechaDesde) query = query.gte('fecha', filtroFechaDesde)
    if (filtroFechaHasta) query = query.lte('fecha', filtroFechaHasta)
    if (filtroCanillita) query = query.eq('canillita_id', filtroCanillita)
    const { data: v } = await query
    setVentas(v || [])
    setLoading(false)
  }

  async function cargarDetallesVenta(venta) {
    const { data } = await supabase
      .from('detalle_ventas').select('*').eq('venta_id', venta.id)
    setEditandoVenta(venta)
    setCanillitaId(venta.canillita_id)
    setFecha(venta.fecha)
    setLineas((data || []).map(d => ({
      id: d.id,
      producto_id: d.producto_id,
      cantidad_salida: d.cantidad_salida,
      cantidad_devolucion: d.cantidad_devolucion
    })))
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() {
    setMostrarForm(false)
    setEditandoVenta(null)
    setCanillitaId('')
    setFecha(new Date().toISOString().split('T')[0])
    setLineas([])
  }

  function agregarLinea() {
    setLineas([...lineas, { producto_id: '', cantidad_salida: '', cantidad_devolucion: '' }])
  }

  function actualizarLinea(i, campo, valor) {
    const nuevas = [...lineas]
    nuevas[i][campo] = valor
    setLineas(nuevas)
  }

  function eliminarLinea(i) {
    setLineas(lineas.filter((_, idx) => idx !== i))
  }

  function calcularLinea(linea) {
    const producto = catalogo.find(p => p.id === linea.producto_id)
    if (!producto) return { vendido: 0, ganancia: 0, totalVenta: 0 }
    const salida = Number(linea.cantidad_salida || 0)
    const devolucion = Number(linea.cantidad_devolucion || 0)
    const vendido = Math.max(0, salida - devolucion)
    const ganancia = vendido * (Number(producto.precio_venta) - Number(producto.precio_costo))
    const totalVenta = vendido * Number(producto.precio_venta)
    return { vendido, ganancia, totalVenta, producto }
  }

  function calcularTotales() {
    return lineas.reduce((acc, linea) => {
      const { ganancia, totalVenta } = calcularLinea(linea)
      return { ganancia: acc.ganancia + ganancia, totalVenta: acc.totalVenta + totalVenta }
    }, { ganancia: 0, totalVenta: 0 })
  }

  async function guardar(e) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const lineasValidas = lineas.filter(l => l.producto_id && Number(l.cantidad_salida) > 0)
    if (!canillitaId || lineasValidas.length === 0) {
      alert('Selecciona un canillita y agrega al menos un producto')
      return
    }

    if (editandoVenta) {
      const { data: detallesExistentes } = await supabase
        .from('detalle_ventas').select('*').eq('venta_id', editandoVenta.id)

      for (const linea of lineasValidas) {
        const { producto, vendido } = calcularLinea(linea)
        const existente = detallesExistentes?.find(d => d.producto_id === linea.producto_id)
        if (existente) {
          const nuevaSalida = existente.cantidad_salida + Number(linea.cantidad_salida)
          const nuevaDevolucion = existente.cantidad_devolucion + Number(linea.cantidad_devolucion || 0)
          await supabase.from('detalle_ventas').update({
            cantidad_salida: nuevaSalida,
            cantidad_devolucion: nuevaDevolucion,
            cantidad: Math.max(0, nuevaSalida - nuevaDevolucion)
          }).eq('id', existente.id)
        } else {
          await supabase.from('detalle_ventas').insert({
            user_id: awaitgetUserId(),
            venta_id: editandoVenta.id,
            producto_id: linea.producto_id,
            nombre_producto: producto.nombre,
            precio_costo: producto.precio_costo,
            precio_venta: producto.precio_venta,
            cantidad_salida: Number(linea.cantidad_salida),
            cantidad_devolucion: Number(linea.cantidad_devolucion || 0),
            cantidad: vendido
          })
        }
      }

      const { data: detallesActualizados } = await supabase
        .from('detalle_ventas').select('*').eq('venta_id', editandoVenta.id)
      const nuevoTotal = detallesActualizados?.reduce((acc, d) => {
        return acc + (Math.max(0, d.cantidad_salida - d.cantidad_devolucion) * Number(d.precio_venta))
      }, 0) || 0
      await supabase.from('ventas')
        .update({ canillita_id: canillitaId, fecha, total: nuevoTotal })
        .eq('id', editandoVenta.id)

    } else {
      const { totalVenta } = calcularTotales()
      const { data: venta } = await supabase
        .from('ventas')
        .insert({ canillita_id: canillitaId, fecha, total: totalVenta, user_id: user?.id})
        .select().single()
      const detalles = lineasValidas.map(linea => {
        const { producto, vendido } = calcularLinea(linea)
        return {
          venta_id: venta.id,
          producto_id: linea.producto_id,
          nombre_producto: producto.nombre,
          precio_costo: producto.precio_costo,
          precio_venta: producto.precio_venta,
          cantidad_salida: Number(linea.cantidad_salida),
          cantidad_devolucion: Number(linea.cantidad_devolucion || 0),
          cantidad: vendido
        }
      })
      await supabase.from('detalle_ventas').insert(detalles)
    }
    cancelar()
    cargarVentas()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta venta?')) return
    await supabase.from('ventas').delete().eq('id', id)
    cargarVentas()
  }

 async function exportarReporte() {
    const hoy = new Date().toISOString().split('T')[0]
    const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0]

    const desde = filtroFechaDesde || primerDiaMes
    const hasta = filtroFechaHasta || hoy

    let query = supabase
      .from('ventas')
      .select('*, canillitas(nombre)')
      .gte('fecha', desde)
      .lte('fecha', hasta)

    if (filtroCanillita) query = query.eq('canillita_id', filtroCanillita)

    const { data: ventasFiltradas } = await query

    if (!ventasFiltradas || ventasFiltradas.length === 0) {
      alert('No hay ventas en el período seleccionado')
      return
    }

    const { data: detalles } = await supabase
      .from('detalle_ventas')
      .select('*, ventas(fecha, canillitas(nombre))')
      .in('venta_id', ventasFiltradas.map(v => v.id))

    const canillitaNombre = filtroCanillita
      ? canillitas.find(c => c.id === filtroCanillita)?.nombre || 'canillita'
      : 'todos'

    let csv = `Reporte del ${desde} al ${hasta} — ${canillitaNombre}\n\n`
    csv += 'Canillita,Fecha,Producto,Salida,Devolución,Vendido,Precio venta,Tu ganancia\n'
    let gananciaTotal = 0
    let ventaTotal = 0

    detalles?.forEach(d => {
      const vendido = Math.max(0, d.cantidad_salida - d.cantidad_devolucion)
      const ganancia = vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      const venta = vendido * Number(d.precio_venta)
      gananciaTotal += ganancia
      ventaTotal += venta
      csv += `${d.ventas?.canillitas?.nombre},${d.ventas?.fecha},${d.nombre_producto},${d.cantidad_salida},${d.cantidad_devolucion},${vendido},$${Number(d.precio_venta).toFixed(2)},$${ganancia.toFixed(2)}\n`
    })

    csv += `\nRESUMEN\n`
    csv += `Total vendido,,,,,,,$${ventaTotal.toFixed(2)}\n`
    csv += `Tu ganancia total,,,,,,,$${gananciaTotal.toFixed(2)}\n`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${desde}-al-${hasta}.csv`
    a.click()
  }
  const totales = calcularTotales()

  async function exportarMesCompleto() {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const mes = new Date().getMonth() + 1
    const anio = new Date().getFullYear()
    const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = `${anio}-${String(mes).padStart(2, '0')}-31`

    const { data: ventasMes } = await supabase
      .from('ventas').select('*, canillitas(nombre)')
      .gte('fecha', primerDia).lte('fecha', ultimoDia)

    if (!ventasMes || ventasMes.length === 0) {
      alert('No hay ventas este mes')
      return
    }

    const { data: detalles } = await supabase
      .from('detalle_ventas')
      .select('*, ventas(fecha, canillitas(nombre))')
      .in('venta_id', ventasMes.map(v => v.id))

    const doc = new jsPDF()

    // Encabezado
    doc.setFontSize(20)
    doc.setTextColor(91, 94, 244)
    doc.text('Snackora ERP', 14, 20)
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Reporte del mes — ${String(mes).padStart(2, '0')}/${anio}`, 14, 30)
    doc.setDrawColor(91, 94, 244)
    doc.line(14, 34, 196, 34)

    let gananciaTotal = 0
    let ventaTotal = 0
    const filas = []

    detalles?.forEach(d => {
      const vendido = Math.max(0, d.cantidad_salida - d.cantidad_devolucion)
      const ganancia = vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      const venta = vendido * Number(d.precio_venta)
      gananciaTotal += ganancia
      ventaTotal += venta
      filas.push([
        d.ventas?.canillitas?.nombre || '—',
        d.ventas?.fecha || '—',
        d.nombre_producto,
        d.cantidad_salida,
        d.cantidad_devolucion,
        vendido,
        `$${Number(d.precio_venta).toFixed(2)}`,
        `$${ganancia.toFixed(2)}`
      ])
    })

    autoTable(doc, {
      startY: 40,
      head: [['Canillita', 'Fecha', 'Producto', 'Salida', 'Devolución', 'Vendido', 'Precio', 'Ganancia']],
      body: filas,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [91, 94, 244], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 248, 252] },
      foot: [['', '', '', '', '', '', 'TOTAL', `$${gananciaTotal.toFixed(2)}`]],
      footStyles: { fillColor: [34, 201, 138], textColor: 255, fontStyle: 'bold' }
    })

    // Resumen final
    const finalY = doc.lastAutoTable.finalY + 15
    doc.setFontSize(11)
    doc.setTextColor(45, 45, 58)
    doc.text('Resumen del mes:', 14, finalY)
    doc.setTextColor(91, 94, 244)
    doc.text(`Total vendido: $${ventaTotal.toFixed(2)}`, 14, finalY + 8)
    doc.setTextColor(34, 201, 138)
    doc.text(`Tu ganancia total: $${gananciaTotal.toFixed(2)}`, 14, finalY + 16)

    doc.save(`reporte-mes-${anio}-${String(mes).padStart(2, '0')}.pdf`)
  }

  async function exportarReporte() {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const hoy = new Date().toISOString().split('T')[0]
    const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0]

    const desde = filtroFechaDesde || primerDiaMes
    const hasta = filtroFechaHasta || hoy

    let query = supabase
      .from('ventas').select('*, canillitas(nombre)')
      .gte('fecha', desde).lte('fecha', hasta)

    if (filtroCanillita) query = query.eq('canillita_id', filtroCanillita)
    const { data: ventasFiltradas } = await query

    if (!ventasFiltradas || ventasFiltradas.length === 0) {
      alert('No hay ventas en el período seleccionado')
      return
    }

    const { data: detalles } = await supabase
      .from('detalle_ventas')
      .select('*, ventas(fecha, canillitas(nombre))')
      .in('venta_id', ventasFiltradas.map(v => v.id))

    const canillitaNombre = filtroCanillita
      ? canillitas.find(c => c.id === filtroCanillita)?.nombre || 'canillita'
      : 'Todos'

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(91, 94, 244)
    doc.text('Snackora ERP', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(`Reporte del ${desde} al ${hasta}`, 14, 29)
    doc.text(`Canillita: ${canillitaNombre}`, 14, 36)
    doc.setDrawColor(91, 94, 244)
    doc.line(14, 40, 196, 40)

    let gananciaTotal = 0
    let ventaTotal = 0
    const filas = []

    detalles?.forEach(d => {
      const vendido = Math.max(0, d.cantidad_salida - d.cantidad_devolucion)
      const ganancia = vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      const venta = vendido * Number(d.precio_venta)
      gananciaTotal += ganancia
      ventaTotal += venta
      filas.push([
        d.ventas?.canillitas?.nombre || '—',
        d.ventas?.fecha || '—',
        d.nombre_producto,
        d.cantidad_salida,
        d.cantidad_devolucion,
        vendido,
        `$${Number(d.precio_venta).toFixed(2)}`,
        `$${ganancia.toFixed(2)}`
      ])
    })

    autoTable(doc, {
      startY: 45,
      head: [['Canillita', 'Fecha', 'Producto', 'Salida', 'Devolución', 'Vendido', 'Precio', 'Ganancia']],
      body: filas,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [91, 94, 244], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 248, 252] },
      foot: [['', '', '', '', '', '', 'TOTAL', `$${gananciaTotal.toFixed(2)}`]],
      footStyles: { fillColor: [34, 201, 138], textColor: 255, fontStyle: 'bold' }
    })

    const finalY = doc.lastAutoTable.finalY + 15
    doc.setFontSize(11)
    doc.setTextColor(45, 45, 58)
    doc.text('Resumen:', 14, finalY)
    doc.setTextColor(91, 94, 244)
    doc.text(`Total vendido: $${ventaTotal.toFixed(2)}`, 14, finalY + 8)
    doc.setTextColor(34, 201, 138)
    doc.text(`Tu ganancia total: $${gananciaTotal.toFixed(2)}`, 14, finalY + 16)

    doc.save(`reporte-${desde}-al-${hasta}.pdf`)
  }

  async function exportarVenta(venta) {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const { data: detalles } = await supabase
      .from('detalle_ventas').select('*').eq('venta_id', venta.id)

    if (!detalles || detalles.length === 0) {
      alert('Esta venta no tiene productos registrados')
      return
    }

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(91, 94, 244)
    doc.text('Snackora ERP', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(`Venta — ${venta.canillitas?.nombre}`, 14, 29)
    doc.text(`Fecha: ${venta.fecha}`, 14, 36)
    doc.setDrawColor(91, 94, 244)
    doc.line(14, 40, 196, 40)

    let gananciaTotal = 0
    let ventaTotal = 0
    const filas = []

    detalles.forEach(d => {
      const vendido = Math.max(0, d.cantidad_salida - d.cantidad_devolucion)
      const ganancia = vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      const venta = vendido * Number(d.precio_venta)
      gananciaTotal += ganancia
      ventaTotal += venta
      filas.push([
        d.nombre_producto,
        d.cantidad_salida,
        d.cantidad_devolucion,
        vendido,
        `$${Number(d.precio_venta).toFixed(2)}`,
        `$${ganancia.toFixed(2)}`
      ])
    })

    autoTable(doc, {
      startY: 45,
      head: [['Producto', 'Salida', 'Devolución', 'Vendido', 'Precio venta', 'Tu ganancia']],
      body: filas,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [91, 94, 244], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 248, 252] },
      foot: [['', '', '', '', 'TOTAL', `$${gananciaTotal.toFixed(2)}`]],
      footStyles: { fillColor: [34, 201, 138], textColor: 255, fontStyle: 'bold' }
    })

    const finalY = doc.lastAutoTable.finalY + 15
    doc.setFontSize(11)
    doc.setTextColor(91, 94, 244)
    doc.text(`Total vendido: $${ventaTotal.toFixed(2)}`, 14, finalY)
    doc.setTextColor(34, 201, 138)
    doc.text(`Tu ganancia: $${gananciaTotal.toFixed(2)}`, 14, finalY + 8)

    doc.save(`venta-${venta.canillitas?.nombre}-${venta.fecha}.pdf`)
  }
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#2d2d3a' }}>Ventas</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
         <button className="btn btn-success" onClick={exportarMesCompleto}>Exportar mes</button>
          <button className="btn btn-primary" onClick={() => mostrarForm ? cancelar() : setMostrarForm(true)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva venta'}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="card" style={{ borderTop: editandoVenta ? '3px solid #f59e0b' : '3px solid #5b5ef4' }}>
          <h3 style={{ marginBottom: '4px', fontSize: '15px', fontWeight: 500 }}>
            {editandoVenta
              ? `Editando — ${editandoVenta.canillitas?.nombre} (${editandoVenta.fecha})`
              : 'Registrar venta del día'}
          </h3>
          {editandoVenta && (
            <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '16px', background: '#fef9c3', padding: '8px 12px', borderRadius: '8px' }}>
              Las cantidades se sumarán a las ya registradas.
            </p>
          )}
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label>Canillita</label>
                <select value={canillitaId} onChange={e => setCanillitaId(e.target.value)} required>
                  <option value="">Selecciona un canillita</option>
                  {canillitas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Fecha</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
              </div>
            </div>

            {editandoVenta && lineas.filter(l => l.id).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#9999aa', marginBottom: '8px' }}>Ya registrado:</p>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Salida</th>
                      <th>Devolución</th>
                      <th>Vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.filter(l => l.id).map((l, i) => {
                      const producto = catalogo.find(p => p.id === l.producto_id)
                      const vendido = Math.max(0, Number(l.cantidad_salida) - Number(l.cantidad_devolucion))
                      return (
                        <tr key={i}>
                          <td>{producto?.nombre || '—'}</td>
                          <td style={{ color: '#5b5ef4' }}>{l.cantidad_salida}</td>
                          <td style={{ color: '#f59e0b' }}>{l.cantidad_devolucion}</td>
                          <td style={{ color: '#22c98a' }}>{vendido}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label>{editandoVenta ? 'Sumar cantidades' : 'Productos del día'}</label>
                <button type="button" className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={agregarLinea}>
                  + Agregar producto
                </button>
              </div>

              {lineas.filter(l => !l.id).length === 0 && (
                <p style={{ color: '#9999aa', fontSize: '13px', textAlign: 'center', padding: '16px', background: '#f7f8fc', borderRadius: '10px' }}>
                  Haz clic en "+ Agregar producto" para continuar
                </p>
              )}

              {lineas.map((linea, i) => {
                if (linea.id) return null
                const { vendido, ganancia, totalVenta } = calcularLinea(linea)
                return (
                  <div key={i} style={{
                    background: '#f7f8fc', borderRadius: '12px',
                    padding: '14px', marginBottom: '10px',
                    border: '1px solid #ebebf0'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                      <div>
                        <label>Producto</label>
                        <select
                          value={linea.producto_id}
                          onChange={e => actualizarLinea(i, 'producto_id', e.target.value)}
                          style={{ margin: 0 }}
                        >
                          <option value="">Selecciona producto</option>
                          {catalogo.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} — ${Number(p.precio_venta).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Salida</label>
                        <input type="number" min="0" placeholder="0"
                          value={linea.cantidad_salida}
                          onChange={e => actualizarLinea(i, 'cantidad_salida', e.target.value)}
                          style={{ margin: 0, textAlign: 'center' }} />
                      </div>
                      <div>
                        <label style={{ color: '#f59e0b' }}>Devolución</label>
                        <input type="number" min="0" placeholder="0"
                          value={linea.cantidad_devolucion}
                          onChange={e => actualizarLinea(i, 'cantidad_devolucion', e.target.value)}
                          style={{ margin: 0, textAlign: 'center', borderColor: '#fcd34d' }} />
                      </div>
                      <button type="button" className="btn btn-danger"
                        style={{ padding: '8px 12px', marginTop: '18px' }}
                        onClick={() => eliminarLinea(i)}>✕</button>
                    </div>
                    {linea.producto_id && linea.cantidad_salida && (
                      <div style={{ display: 'flex', gap: '20px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ebebf0' }}>
                        <span style={{ fontSize: '12px', color: '#9999aa' }}>Vendido: <strong style={{ color: '#2d2d3a' }}>{vendido}</strong></span>
                        <span style={{ fontSize: '12px', color: '#9999aa' }}>Total: <strong style={{ color: '#5b5ef4' }}>${totalVenta.toFixed(2)}</strong></span>
                        <span style={{ fontSize: '12px', color: '#9999aa' }}>Tu ganancia: <strong style={{ color: '#22c98a' }}>${ganancia.toFixed(2)}</strong></span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {lineas.filter(l => !l.id).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#f0f0ff', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tu ganancia</p>
                  <p style={{ fontSize: '30px', fontWeight: 500, color: '#5b5ef4', marginTop: '4px' }}>${totales.ganancia.toFixed(2)}</p>
                </div>
                <div style={{ background: '#f0fdf8', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total vendido</p>
                  <p style={{ fontSize: '30px', fontWeight: 500, color: '#22c98a', marginTop: '4px' }}>${totales.totalVenta.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                {editandoVenta ? 'Guardar cambios' : 'Guardar venta del día'}
              </button>
              <button type="button" className="btn"
                style={{ background: '#f7f8fc', color: '#9999aa', padding: '12px 20px' }}
                onClick={cancelar}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#2d2d3a' }}>Historial de ventas</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label>Desde</label>
              <input type="date" value={filtroFechaDesde}
                onChange={e => setFiltroFechaDesde(e.target.value)}
                style={{ margin: 0, width: '150px' }} />
            </div>
            <div>
              <label>Hasta</label>
              <input type="date" value={filtroFechaHasta}
                onChange={e => setFiltroFechaHasta(e.target.value)}
                style={{ margin: 0, width: '150px' }} />
            </div>
            <div>
              <label>Canillita</label>
              <select value={filtroCanillita}
                onChange={e => setFiltroCanillita(e.target.value)}
                style={{ margin: 0, width: '160px' }}>
                <option value="">Todos</option>
                {canillitas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            {(filtroFechaDesde || filtroFechaHasta || filtroCanillita) && (
              <button className="btn"
                style={{ background: '#f7f8fc', color: '#9999aa', marginBottom: '12px' }}
                onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); setFiltroCanillita('') }}>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>Cargando...</p>
        ) : ventas.length === 0 ? (
          <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>
            No hay ventas para mostrar
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Canillita</th>
                <th>Fecha</th>
                <th>Total vendido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                 <td>{v.canillitas?.nombre}</td>
                  <td>{v.fecha}</td>
                  <td style={{ color: '#5b5ef4', fontWeight: 500 }}>${Number(v.total).toFixed(2)}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
  <button className="btn"
    style={{ background: '#fef9c3', color: '#92400e', padding: '6px 12px' }}
    onClick={() => cargarDetallesVenta(v)}>
    Editar
  </button>
  <button className="btn btn-danger" style={{ padding: '6px 12px' }}
    onClick={() => eliminar(v.id)}>
    Eliminar
  </button>
  <button className="btn"
    style={{ background: '#f0f0ff', color: '#5b5ef4', padding: '6px 12px' }}
    onClick={() => exportarVenta(v)}>
    Exportar
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}