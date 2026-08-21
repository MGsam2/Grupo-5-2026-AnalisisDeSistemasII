import { useState, useEffect } from 'react';
import RegistrarQueja from './RegistrarQueja';
import VerQuejas from './VerQuejas';

function Portal({ onLogout }) {
  // Ahora la vista por defecto es el resumen ('inicio')
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  
  // Estados para nuestro Dashboard calculado
  const [estadisticas, setEstadisticas] = useState({ total: 0, enProceso: 0, finalizadas: 0 });
  const [cargandoStats, setCargandoStats] = useState(true);

  // Función de seguridad para extraer el token
  const obtenerToken = () => {
    let tokenString = localStorage.getItem('token');
    if (tokenString && tokenString.startsWith('{')) {
      try {
        const tokenObj = JSON.parse(tokenString);
        return tokenObj.token || tokenString;
      } catch (err) {
        return tokenString;
      }
    }
    return tokenString;
  };

  // Función utilitaria para leer campos que podrían venir como Objetos desde Spring Boot
  const obtenerTextoCampo = (campo) => {
    if (!campo) return '';
    if (typeof campo === 'object' && campo.nombre) return campo.nombre;
    return String(campo);
  };

  // Efecto que carga los datos en segundo plano SOLO para armar el Dashboard
  useEffect(() => {
    const cargarEstadisticas = async () => {
      const token = obtenerToken();
      if (!token) return;

      try {
        const respuesta = await fetch('/api/quejas', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (respuesta.ok) {
          const data = await respuesta.json();
          if (Array.isArray(data)) {
            // Clasificamos usando las Reglas de Negocio oficiales
            const finalizadas = data.filter(q => {
              const estado = obtenerTextoCampo(q.estado).replace(/\s+/g, '');
              return ['Aprobada', 'Denegada', 'Archivada'].includes(estado);
            }).length;

            setEstadisticas({
              total: data.length,
              finalizadas: finalizadas,
              enProceso: data.length - finalizadas
            });
          }
        }
      } catch (error) {
        console.error("Error cargando estadísticas para el dashboard", error);
      } finally {
        setCargandoStats(false);
      }
    };

    cargarEstadisticas();
  }, []); // Se ejecuta una sola vez al cargar el portal

  return (
    <div className="portal-layout">

      {/* MENÚ LATERAL (SIDEBAR) */}
      <aside className={`sidebar ${mostrarSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-circle-small">
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'white', letterSpacing: '1px' }}>BCN</span>
          </div>
          <div className="brand-text">
            <h2 style={{ fontSize: '15px' }}>Banco Capital Nacional</h2>
            <p>PORTAL DE GESTIÓN</p>
          </div>
        </div>

        <div className="sidebar-menu-title">PANEL DE CONTROL</div>

        <ul className="nav-list">
          <li className="nav-item">
            <button
              onClick={() => setVistaActiva('inicio')}
              className={`nav-btn ${vistaActiva === 'inicio' ? 'active' : ''}`}
            >
              Resumen General
            </button>
          </li>
        </ul>

        <div className="sidebar-menu-title" style={{ marginTop: '10px' }}>OPERACIONES</div>

        <ul className="nav-list">
          <li className="nav-item">
            <button
              onClick={() => setVistaActiva('registrar')}
              className={`nav-btn ${vistaActiva === 'registrar' ? 'active' : ''}`}
            >
              Registrar queja
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setVistaActiva('ver')}
              className={`nav-btn ${vistaActiva === 'ver' ? 'active' : ''}`}
            >
              Quejas registradas
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="main-wrapper">

        <header className="topbar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%' }}>
            {/* Botón de Hamburguesa Animado */}
            <button
              onClick={() => setMostrarSidebar(!mostrarSidebar)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s',
                transform: mostrarSidebar ? 'rotate(90deg)' : 'rotate(0deg)'
              }}
              title="Alternar Menú"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="user-profile">
            <div className="avatar" style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>UB</div>
            <span>Usuario Bancario</span>
          </div>
        </header>

        <main className="content-area">

          {/* VISTA DE DASHBOARD / RESUMEN */}
          {vistaActiva === 'inicio' && (
            <div className="fade-in">
              <div className="content-header" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '0 0 10px 0' }}>Bienvenido a su Portal</h1>
                <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
                  Resumen general de sus gestiones y estado actual de sus solicitudes.
                </p>
              </div>

              {/* TARJETAS DE INDICADORES (KPIs) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Total de Quejas Emitidas</p>
                  <h3 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>
                    {cargandoStats ? '...' : estadisticas.total}
                  </h3>
                </div>

                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase' }}>En Proceso (Análisis)</p>
                  <h3 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>
                    {cargandoStats ? '...' : estadisticas.enProceso}
                  </h3>
                </div>

                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Finalizadas (Resueltas)</p>
                  <h3 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>
                    {cargandoStats ? '...' : estadisticas.finalizadas}
                  </h3>
                </div>

              </div>

              {/* SECCIÓN INFORMATIVA DE VALOR */}
              <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '20px' }}>Transparencia en su Gestión</h3>
                <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '25px', fontSize: '1.05rem' }}>
                  En Banco Capital Nacional valoramos su retroalimentación. Cada ticket generado sigue un estricto flujo de revisión corporativa para garantizar una resolución justa y oportuna.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div>
                    <h4 style={{ color: '#0f172a', fontSize: '1rem', marginBottom: '8px' }}>1. Registro y Validación</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Su queja es asignada a un Agente Bancario especializado para una revisión inicial de los hechos y documentos.</p>
                  </div>
                  <div>
                    <h4 style={{ color: '#0f172a', fontSize: '1rem', marginBottom: '8px' }}>2. Análisis Escalonado</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>El caso es evaluado exhaustivamente por Supervisores y Jefaturas garantizando objetividad institucional.</p>
                  </div>
                  <div>
                    <h4 style={{ color: '#0f172a', fontSize: '1rem', marginBottom: '8px' }}>3. Dictamen Final</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>La Gerencia emite la resolución definitiva (Aprobada o Denegada), notificándole el resultado final.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VISTAS OPERATIVAS */}
          {vistaActiva === 'registrar' && (
            <RegistrarQueja />
          )}

          {vistaActiva === 'ver' && (
            <VerQuejas />
          )}

        </main>
      </div>
    </div>
  );
}

export default Portal;