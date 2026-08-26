import { useState, useEffect } from 'react';
import RegistrarQueja from './RegistrarQueja';
import VerQuejas from './VerQuejas';

function Portal({ onLogout }) {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [mostrarSidebar, setMostrarSidebar] = useState(false);

  const [estadisticas, setEstadisticas] = useState({ total: 0, enProceso: 0, finalizadas: 0 });
  const [cargandoStats, setCargandoStats] = useState(true);

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

  const obtenerTextoCampo = (campo) => {
    if (!campo) return '';
    if (typeof campo === 'object' && campo.nombre) return campo.nombre;
    return String(campo);
  };

  // El backend solo devuelve las quejas de este usuario (RN08)
  useEffect(() => {
    const cargarMisEstadisticas = async () => {
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
        console.error("Error cargando mis estadísticas", error);
      } finally {
        setCargandoStats(false);
      }
    };

    cargarMisEstadisticas();
  }, []);

  const nombreUsuario = localStorage.getItem('nombreCliente') || '';
  const apellidoUsuario = localStorage.getItem('apellidoCliente') || '';

  // Formateamos el nombre completo (si no hay datos, cae por defecto a 'Mi Perfil')
  const nombreParaMostrar = nombreUsuario || apellidoUsuario
    ? `${nombreUsuario} ${apellidoUsuario}`.trim()
    : 'Mi Perfil';

  // Calculamos las iniciales para el Avatar (ej. "Juan Pérez" -> "JP")
  const iniciales = (nombreUsuario.charAt(0) + apellidoUsuario.charAt(0)).toUpperCase() || 'MI';

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
            <p>PORTAL DEL CLIENTE</p>
          </div>
        </div>

        <div className="sidebar-menu-title" style={{ marginTop: '10px' }}>MIS GESTIONES</div>

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
            <div className="avatar" style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>
              {iniciales}
            </div>
            <span style={{ textTransform: 'capitalize' }}>
              {nombreParaMostrar}
            </span>
          </div>
        </header>

        <main className="content-area">

          {/* VISTA DE DASHBOARD / RESUMEN DEL CLIENTE */}
          {vistaActiva === 'inicio' && (
            <div className="fade-in">
              <div className="content-header" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '0 0 10px 0' }}>Hola, bienvenido a su portal</h1>
                <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
                  Aquí puede consultar el estado de sus reclamos personales y generar nuevos tickets.
                </p>
              </div>

              {/* TARJETAS DE INDICADORES (KPIs DEL CLIENTE) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }}>

                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Mis Quejas Registradas</p>
                  <h3 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>
                    {cargandoStats ? '...' : estadisticas.total}
                  </h3>
                </div>

                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Mis Tickets en Proceso</p>
                  <h3 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>
                    {cargandoStats ? '...' : estadisticas.enProceso}
                  </h3>
                </div>

                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Mis Casos Finalizados</p>
                  <h3 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>
                    {cargandoStats ? '...' : estadisticas.finalizadas}
                  </h3>
                </div>

              </div>

              {/* SECCIÓN INFORMATIVA DE VALOR PARA EL USUARIO */}
              <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '20px' }}>¿Cómo procesamos sus solicitudes?</h3>
                <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '25px', fontSize: '1.05rem' }}>
                  Su tranquilidad es nuestra prioridad. Cada caso que nos reporta avanza por distintas etapas para garantizar que reciba una respuesta justa y bien fundamentada.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div>
                    <h4 style={{ color: '#0f172a', fontSize: '1rem', marginBottom: '8px' }}>1. Recepción</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Al generar su ticket, pasa al estado <strong>Registrada</strong> y un agente bancario se encarga de revisar los datos iniciales[cite: 2].</p>
                  </div>
                  <div>
                    <h4 style={{ color: '#0f172a', fontSize: '1rem', marginBottom: '8px' }}>2. Análisis de su Caso</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Si su solicitud requiere validaciones profundas, avanzará por las etapas de revisión con nuestros supervisores para asegurar la calidad de la respuesta[cite: 2].</p>
                  </div>
                  <div>
                    <h4 style={{ color: '#0f172a', fontSize: '1rem', marginBottom: '8px' }}>3. Respuesta Final</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Una vez concluida la investigación, su caso cambiará a <strong>Aprobada</strong> o <strong>Denegada</strong>, notificándole la resolución formal[cite: 2].</p>
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