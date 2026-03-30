import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function Dashboard() {
  const [datos, setDatos] = useState({
    gananciaHoy: 0, gananciaMes: 0,
    ventasHoy: 0, ventasMes: 0, canillitas: 0
  })
  const [resumenCanillitas, setResumenCanillitas] = useState([])
  const [productosMes, setProductosMes] = useState([])
  const [graficaSemana, setGraficaSemana] = useState([])
  const [graficaAnual, setGraficaAnual] = useState([])
  const [graficaCanillitas, setGraficaCanillitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)

  useEffect(() => {
    cargar()
    const intervalo = setInterval(cargar, 30000)
    return () => clearInterval(intervalo)
  }, [])

  async function cargar() {
    const { data: { user } } = await supabase.auth.getUser()
    const uid = user?.id
    const hoy = new Date().toISOString().split('T')[0]
    const primerDia = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0]

    const { data: ventas } = await supabase
      .from('ventas').select('*, canillitas(nombre)').eq('user_id', uid)

    const { data: detalles } = await supabase
      .from('detalle_ventas')
      .select('*, ventas(fecha, canillita_id, canillitas(nombre))')

    const { data: canillitasActivos } = await supabase
      .from('canillitas').select('id').eq('activo', true).eq('user_id', uid)

    if (!detalles) { setLoading(false); return }

    const misVentasIds = ventas?.map(v => v.id) || []
    const misDetalles = detalles.filter(d => misVentasIds.includes(d.venta_id))
    const hoyDetalles = misDetalles.filter(d => d.ventas?.fecha === hoy)
    const mesDetalles = misDetalles.filter(d => d.ventas?.fecha >= primerDia)

    function calcGanancia(arr) {
      return arr.reduce((a, d) => {
        const vendido = Math.max(0, Number(d.cantidad_salida) - Number(d.cantidad_devolucion))
        return a + vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      }, 0)
    }

    function calcVenta(arr) {
      return arr.reduce((a, d) => {
        const vendido = Math.max(0, Number(d.cantidad_salida) - Number(d.cantidad_devolucion))
        return a + vendido * Number(d.precio_venta)
      }, 0)
    }

    // Gráfica semana — últimos 7 días
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const semana = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      const diaNombre = dias[fecha.getDay()]
      const detDia = misDetalles.filter(d => d.ventas?.fecha === fechaStr)
      semana.push({
        dia: diaNombre,
        ganancia: Number(calcGanancia(detDia).toFixed(2)),
        ventas: Number(calcVenta(detDia).toFixed(2))
      })
    }
    setGraficaSemana(semana)

    // Gráfica anual — últimos 12 meses
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const anual = []
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() - i)
      const anio = fecha.getFullYear()
      const mes = fecha.getMonth()
      const primerDiaMes = `${anio}-${String(mes + 1).padStart(2, '0')}-01`
      const ultimoDiaMes = `${anio}-${String(mes + 1).padStart(2, '0')}-31`
      const detMes = misDetalles.filter(d =>
        d.ventas?.fecha >= primerDiaMes && d.ventas?.fecha <= ultimoDiaMes
      )
      anual.push({
        mes: meses[mes],
        ganancia: Number(calcGanancia(detMes).toFixed(2)),
        ventas: Number(calcVenta(detMes).toFixed(2))
      })
    }
    setGraficaAnual(anual)

    // Gráfica canillitas — quién vende más
    const porCanillita = {}
    misDetalles.forEach(d => {
      const nombre = d.ventas?.canillitas?.nombre || 'Sin nombre'
      const id = d.ventas?.canillita_id
      if (!porCanillita[id]) {
        porCanillita[id] = { nombre, ganancia: 0, ventas: 0 }
      }
      const vendido = Math.max(0, Number(d.cantidad_salida) - Number(d.cantidad_devolucion))
      porCanillita[id].ganancia += vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      porCanillita[id].ventas += vendido * Number(d.precio_venta)
    })
    setGraficaCanillitas(Object.values(porCanillita).map(c => ({
      nombre: c.nombre,
      ganancia: Number(c.ganancia.toFixed(2)),
      ventas: Number(c.ventas.toFixed(2))
    })).sort((a, b) => b.ventas - a.ventas))

    // Resumen por canillita del mes
    const porCanillitaMes = {}
    mesDetalles.forEach(d => {
      const nombre = d.ventas?.canillitas?.nombre || 'Sin nombre'
      const id = d.ventas?.canillita_id
      if (!porCanillitaMes[id]) {
        porCanillitaMes[id] = { nombre, ganancia: 0, gananciaCanillita: 0, totalVendido: 0, productos: {} }
      }
      const vendido = Math.max(0, Number(d.cantidad_salida) - Number(d.cantidad_devolucion))
      const ganancia = vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      const gananciaCanillita = vendido * Number(d.precio_costo)
      const venta = vendido * Number(d.precio_venta)
      porCanillitaMes[id].ganancia += ganancia
      porCanillitaMes[id].gananciaCanillita += gananciaCanillita
      porCanillitaMes[id].totalVendido += venta
      if (!porCanillitaMes[id].productos[d.nombre_producto]) {
        porCanillitaMes[id].productos[d.nombre_producto] = { cantidad: 0, ganancia: 0, gananciaCanillita: 0, venta: 0 }
      }
      porCanillitaMes[id].productos[d.nombre_producto].cantidad += vendido
      porCanillitaMes[id].productos[d.nombre_producto].ganancia += ganancia
      porCanillitaMes[id].productos[d.nombre_producto].gananciaCanillita += gananciaCanillita
      porCanillitaMes[id].productos[d.nombre_producto].venta += venta
    })

    const porProducto = {}
    mesDetalles.forEach(d => {
      const vendido = Math.max(0, Number(d.cantidad_salida) - Number(d.cantidad_devolucion))
      if (!porProducto[d.nombre_producto]) {
        porProducto[d.nombre_producto] = { cantidad: 0, ganancia: 0, venta: 0 }
      }
      porProducto[d.nombre_producto].cantidad += vendido
      porProducto[d.nombre_producto].ganancia += vendido * (Number(d.precio_venta) - Number(d.precio_costo))
      porProducto[d.nombre_producto].venta += vendido * Number(d.precio_venta)
    })

    setDatos({
      gananciaHoy: calcGanancia(hoyDetalles),
      gananciaMes: calcGanancia(mesDetalles),
      ventasHoy: calcVenta(hoyDetalles),
      ventasMes: calcVenta(mesDetalles),
      canillitas: canillitasActivos?.length || 0
    })
    setResumenCanillitas(Object.values(porCanillitaMes))
    setProductosMes(Object.entries(porProducto).map(([nombre, v]) => ({ nombre, ...v })))
    setUltimaActualizacion(new Date().toLocaleTimeString())
    setLoading(false)
  }

  const tooltipStyle = {
    background: 'white', border: '1px solid #f0f0f5',
    borderRadius: '10px', fontSize: '13px', color: '#2d2d3a'
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#9999aa' }}>Cargando...</div>
  )

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#2d2d3a' }}>Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {ultimaActualizacion && (
            <span style={{ fontSize: '12px', color: '#9999aa' }}>
              Actualizado: {ultimaActualizacion}
            </span>
          )}
          <button className="btn"
            style={{ background: '#f0f0ff', color: '#5b5ef4', padding: '8px 16px', fontSize: '13px' }}
            onClick={cargar}>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: '4px solid #5b5ef4' }}>
          <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tu ganancia hoy</p>
          <p style={{ fontSize: '36px', fontWeight: 500, color: '#5b5ef4', marginTop: '8px' }}>${datos.gananciaHoy.toFixed(2)}</p>
          <p style={{ color: '#9999aa', fontSize: '12px', marginTop: '4px' }}>de ${datos.ventasHoy.toFixed(2)} vendidos hoy</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #22c98a' }}>
          <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tu ganancia del mes</p>
          <p style={{ fontSize: '36px', fontWeight: 500, color: '#22c98a', marginTop: '8px' }}>${datos.gananciaMes.toFixed(2)}</p>
          <p style={{ color: '#9999aa', fontSize: '12px', marginTop: '4px' }}>de ${datos.ventasMes.toFixed(2)} vendidos este mes</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total vendido hoy</p>
          <p style={{ fontSize: '36px', fontWeight: 500, color: '#f59e0b', marginTop: '8px' }}>${datos.ventasHoy.toFixed(2)}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #06b6d4' }}>
          <p style={{ fontSize: '11px', color: '#9999aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Canillitas activos</p>
          <p style={{ fontSize: '36px', fontWeight: 500, color: '#06b6d4', marginTop: '8px' }}>{datos.canillitas}</p>
        </div>
      </div>

      {/* Gráfica semana */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#2d2d3a', marginBottom: '20px' }}>
          Ventas de la semana
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={graficaSemana} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#9999aa' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9999aa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '13px', color: '#9999aa' }} />
            <Line type="monotone" dataKey="ventas" name="Total vendido" stroke="#5b5ef4" strokeWidth={2} dot={{ fill: '#5b5ef4', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="ganancia" name="Tu ganancia" stroke="#22c98a" strokeWidth={2} dot={{ fill: '#22c98a', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica anual */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#2d2d3a', marginBottom: '20px' }}>
          Evolución del año
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={graficaAnual} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9999aa' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9999aa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '13px', color: '#9999aa' }} />
            <Line type="monotone" dataKey="ventas" name="Total vendido" stroke="#5b5ef4" strokeWidth={2} dot={{ fill: '#5b5ef4', r: 3 }} />
            <Line type="monotone" dataKey="ganancia" name="Tu ganancia" stroke="#22c98a" strokeWidth={2} dot={{ fill: '#22c98a', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica canillitas */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#2d2d3a', marginBottom: '20px' }}>
          Canillitas — quién vende más
        </h3>
        {graficaCanillitas.length === 0 ? (
          <p style={{ color: '#9999aa', textAlign: 'center', padding: '40px' }}>
            Aún no hay ventas registradas
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={graficaCanillitas} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#9999aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9999aa' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '13px', color: '#9999aa' }} />
              <Bar dataKey="ventas" name="Total vendido" fill="#5b5ef4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ganancia" name="Tu ganancia" fill="#22c98a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Resumen por canillita */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
          Resumen del mes por canillita
        </h3>
        {resumenCanillitas.length === 0 ? (
          <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>
            Aún no hay ventas registradas este mes
          </p>
        ) : (
          resumenCanillitas.map((c, i) => (
            <div key={i} style={{
              border: '1px solid #f0f0f5', borderRadius: '12px',
              marginBottom: '16px', overflow: 'hidden'
            }}>
              <div style={{
                background: '#f7f8fc', padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <p style={{ fontWeight: 500, fontSize: '14px', color: '#2d2d3a' }}>
                  {c.nombre}
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#22c98a', fontWeight: 500 }}>
                    Tu ganancia: ${c.ganancia.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 500 }}>
                    Ganancia canillita: ${c.gananciaCanillita.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '13px', color: '#5b5ef4', fontWeight: 500 }}>
                    Total: ${c.totalVendido.toFixed(2)}
                  </span>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Unidades</th>
                    <th>Total vendido</th>
                    <th>Tu ganancia</th>
                    <th>Ganancia canillita</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(c.productos).map(([nombre, p], j) => (
                    <tr key={j}>
                      <td style={{ fontWeight: 500 }}>{nombre}</td>
                      <td>{p.cantidad}</td>
                      <td style={{ color: '#5b5ef4' }}>${p.venta.toFixed(2)}</td>
                      <td style={{ color: '#22c98a', fontWeight: 500 }}>${p.ganancia.toFixed(2)}</td>
                      <td style={{ color: '#f59e0b', fontWeight: 500 }}>${p.gananciaCanillita.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Consolidado productos */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 500 }}>
          Todos los productos del mes
        </h3>
        {productosMes.length === 0 ? (
          <p style={{ color: '#9999aa', textAlign: 'center', padding: '24px' }}>
            Aún no hay productos registrados este mes
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Total unidades</th>
                <th>Total vendido</th>
                <th>Tu ganancia</th>
              </tr>
            </thead>
            <tbody>
              {productosMes.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                  <td>{p.cantidad} unidades</td>
                  <td style={{ color: '#5b5ef4', fontWeight: 500 }}>${p.venta.toFixed(2)}</td>
                  <td style={{ color: '#22c98a', fontWeight: 500 }}>${p.ganancia.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ background: '#f7f8fc', borderTop: '2px solid #f0f0f5' }}>
                <td style={{ fontWeight: 500 }}>TOTAL</td>
                <td style={{ fontWeight: 500 }}>{productosMes.reduce((a, p) => a + p.cantidad, 0)} unidades</td>
                <td style={{ fontWeight: 500, color: '#5b5ef4' }}>${productosMes.reduce((a, p) => a + p.venta, 0).toFixed(2)}</td>
                <td style={{ fontWeight: 500, color: '#22c98a', fontSize: '15px' }}>${productosMes.reduce((a, p) => a + p.ganancia, 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}