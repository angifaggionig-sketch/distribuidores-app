import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Landing() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#2d2d3a', background: '#fff' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f5',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.03em', color: '#2d2d3a' }}>
          Snackora <span style={{ color: '#0e86b6' }}>ERP</span>
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/" style={{
            color: '#9999aa', textDecoration: 'none',
            padding: '8px 16px', borderRadius: '10px',
            fontSize: '14px', fontWeight: 400
          }}>Iniciar sesión</Link>
          <Link to="/registro" style={{
            background: '#0e86b6', color: 'white',
            textDecoration: 'none', padding: '9px 20px',
            borderRadius: '10px', fontSize: '14px', fontWeight: 500
          }}>Comenzar gratis</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px',
        background: 'linear-gradient(160deg, #fafafe 0%, #f0f0ff 50%, #fafafe 100%)'
      }}>
        <div style={{ maxWidth: '720px' }}>
          <span style={{
            background: '#f0f0ff', color: '#0e86b6',
            padding: '6px 16px', borderRadius: '20px',
            fontSize: '13px', fontWeight: 500, letterSpacing: '0.02em',
            display: 'inline-block', marginBottom: '24px'
          }}>
            Software para microempresarios
          </span>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-0.03em', marginBottom: '24px', color: '#1a1a2e'
          }}>
            Controla tus ventas,<br />
            <span style={{ color: '#0e86b6' }}>conoce tus ganancias</span>
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#64748b', lineHeight: 1.7,
            marginBottom: '40px', maxWidth: '520px', margin: '0 auto 40px'
          }}>
            Snackora ERP te ayuda a registrar las ventas diarias de tus canillitas,
            ver tus ganancias en tiempo real y generar reportes mensuales con un clic.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/registro" style={{
              background: '#0e86b6', color: 'white',
              textDecoration: 'none', padding: '14px 32px',
              borderRadius: '12px', fontSize: '16px', fontWeight: 600,
              boxShadow: '0 8px 24px rgba(91,94,244,0.3)',
              transition: 'all 0.2s ease'
            }}>
              Comenzar gratis
            </Link>
            <a href="#funciones" style={{
              background: 'white', color: '#2d2d3a',
              textDecoration: 'none', padding: '14px 32px',
              borderRadius: '12px', fontSize: '16px', fontWeight: 500,
              border: '1.5px solid #e2e8f0'
            }}>
              Ver funciones
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: '60px 24px', background: 'white',
        borderTop: '1px solid #f0f0f5', borderBottom: '1px solid #f0f0f5'
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px',
          textAlign: 'center'
        }}>
          {[
            { numero: '100%', texto: 'En la nube, accede desde cualquier dispositivo' },
            { numero: '1 clic', texto: 'Para generar tu reporte mensual completo' },
            { numero: '$0', texto: 'Para empezar, sin tarjeta de crédito' },
          ].map((s, i) => (
            <div key={i}>
              <p style={{ fontSize: '40px', fontWeight: 700, color: '#0e86b6', letterSpacing: '-0.03em' }}>
                {s.numero}
              </p>
              <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px', lineHeight: 1.5 }}>
                {s.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" style={{ padding: '100px 24px', background: '#fafafe' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
              letterSpacing: '-0.03em', color: '#1a1a2e', marginBottom: '16px'
            }}>
              Todo lo que necesitas en un solo lugar
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '480px', margin: '0 auto' }}>
              Diseñado específicamente para distribuidores de snacks y bebidas
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e86b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    titulo: 'Control de canillitas',
    desc: 'Registra a cada vendedor, actívalos o desactívalos según necesites. Todo organizado en un panel claro.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e86b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    titulo: 'Registro diario de ventas',
    desc: 'Anota la salida y devolución de productos por canillita. El vendido real se calcula automáticamente.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e86b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="16"/>
      </svg>
    ),
    titulo: 'Ganancias en tiempo real',
    desc: 'Ve cuánto ganaste hoy, esta semana y este mes. Por canillita y por producto, sin hacer cuentas.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e86b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    titulo: 'Reportes mensuales',
    desc: 'Genera un reporte completo de tus ventas con un clic. Filtra por fecha o por canillita.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e86b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    titulo: 'Exportar a Excel',
    desc: 'Descarga tus datos en formato CSV para abrirlos en Excel o Google Sheets cuando quieras.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e86b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    titulo: 'Datos seguros y privados',
    desc: 'Cada distribuidor tiene su propio acceso. Tus datos son solo tuyos, nadie más los ve.'
  },
].map((f, i) => (
  <div key={i} style={{
    background: 'white', borderRadius: '16px',
    padding: '28px', border: '1px solid #f0f0f5',
    transition: 'all 0.2s ease'
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px',
      background: '#f0f0ff', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: '16px'
    }}>
      {f.icon}
    </div>
    <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', color: '#1a1a2e' }}>
      {f.titulo}
    </h3>
    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7 }}>
      {f.desc}
    </p>
  </div>
))} 
         </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" style={{ padding: '100px 24px', background: '#fafafe' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
            letterSpacing: '-0.03em', color: '#1a1a2e', marginBottom: '16px'
          }}>
            Precios simples y transparentes
          </h2>
          <p style={{ color: '#64748b', fontSize: '17px', marginBottom: '64px' }}>
            Sin sorpresas, cancela cuando quieras
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              {
                nombre: 'Básico', precio: '$5', periodo: '/mes',
                color: '#f7f8fc', border: '#e2e8f0', btnBg: '#0e86b6', btnColor: 'white',
                features: ['Hasta 5 canillitas', 'Registro diario', 'Reporte mensual', 'Exportar CSV']
              },
              {
                nombre: 'Pro', precio: '$10', periodo: '/mes',
                color: '#0e86b6', border: '#0e86b6', btnBg: 'white', btnColor: '#0e86b6',
                destacado: true,
                features: ['Canillitas ilimitados', 'Reportes avanzados', 'Exportar Excel/PDF', 'Soporte prioritario']
              },
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.destacado ? '#0e86b6' : 'white',
                borderRadius: '20px', padding: '36px',
                border: `1.5px solid ${plan.border}`,
                boxShadow: plan.destacado ? '0 20px 60px rgba(91,94,244,0.3)' : 'none',
                transform: plan.destacado ? 'scale(1.04)' : 'none'
              }}>
                {plan.destacado && (
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 500, display: 'inline-block', marginBottom: '16px'
                  }}>Más popular</span>
                )}
                <p style={{ fontSize: '16px', fontWeight: 600, color: plan.destacado ? 'white' : '#2d2d3a', marginBottom: '8px' }}>
                  {plan.nombre}
                </p>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '48px', fontWeight: 700, color: plan.destacado ? 'white' : '#2d2d3a', letterSpacing: '-0.03em' }}>
                    {plan.precio}
                  </span>
                  <span style={{ color: plan.destacado ? 'rgba(255,255,255,0.7)' : '#9999aa', fontSize: '15px' }}>
                    {plan.periodo}
                  </span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', textAlign: 'left' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{
                      padding: '8px 0', borderBottom: `1px solid ${plan.destacado ? 'rgba(255,255,255,0.1)' : '#f0f0f5'}`,
                      fontSize: '14px', color: plan.destacado ? 'rgba(255,255,255,0.9)' : '#64748b',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <span style={{ color: plan.destacado ? 'rgba(255,255,255,0.7)' : '#22c98a' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/registro" style={{
                  display: 'block', textAlign: 'center',
                  background: plan.btnBg, color: plan.btnColor,
                  textDecoration: 'none', padding: '12px',
                  borderRadius: '12px', fontSize: '14px', fontWeight: 600
                }}>
                  Comenzar ahora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{
        padding: '100px 24px', background: '#1a1a2e', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
            color: 'white', letterSpacing: '-0.03em', marginBottom: '16px'
          }}>
            Empieza a controlar tu negocio hoy
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', marginBottom: '40px' }}>
            Únete a los distribuidores que ya llevan sus ventas con Snackora ERP
          </p>
          <Link to="/registro" style={{
            background: '#0e86b6', color: 'white',
            textDecoration: 'none', padding: '16px 40px',
            borderRadius: '12px', fontSize: '16px', fontWeight: 600,
            boxShadow: '0 8px 24px rgba(91,94,244,0.4)',
            display: 'inline-block'
          }}>
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', background: '#111827',
        textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
          © 2026 Snackora ERP — Todos los derechos reservados
        </p>
      </footer>

    </div>
  )
}