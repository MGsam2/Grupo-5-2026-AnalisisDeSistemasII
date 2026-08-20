import { useState } from 'react';
import RegistrarQueja from './RegistrarQueja';
import VerQuejas from './VerQuejas';

function Portal({ onLogout }) {
  const [vistaActiva, setVistaActiva] = useState('sobre-nosotros');
  const [mostrarSidebar, setMostrarSidebar] = useState(false);

  return (
    <div className="portal-layout">

      {/* 
        El sidebar ya no se destruye. 
        Ahora alterna entre las clases 'open' y 'closed' para animarse con CSS. 
      */}
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

        <div className="sidebar-menu-title">OPERACIONES</div>

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

      <div className="main-wrapper">

        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%' }}>

            {/* Botón de Hamburguesa Animado */}
            <button
              onClick={() => setMostrarSidebar(!mostrarSidebar)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s',
                transform: mostrarSidebar ? 'rotate(90deg)' : 'rotate(0deg)'
              }}
              title="Alternar Menú de Operaciones"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="topbar-tabs">
              <button
                onClick={() => setVistaActiva('sobre-nosotros')}
                className={`tab-btn ${vistaActiva === 'sobre-nosotros' ? 'active-tab' : ''}`}
              >
                Sobre Nosotros
              </button>
              <button
                onClick={() => setVistaActiva('servicios')}
                className={`tab-btn ${vistaActiva === 'servicios' ? 'active-tab' : ''}`}
              >
                Nuestros Servicios
              </button>
            </div>
          </div>

          <div className="user-profile">
            <div className="avatar" style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>UB</div>
            <span>Usuario Bancario</span>
          </div>
        </header>

        <main className="content-area">

          {vistaActiva === 'sobre-nosotros' && (
            <div className="fade-in">
              <div className="content-header">
                <h1>Sobre Nosotros</h1>
                <p>Conoce más sobre nuestra institución y compromiso.</p>
              </div>
              <div className="info-card-container">
                <div className="content-card">
                  <h3 className="card-title">Nuestra Misión</h3>
                  <p className="card-text">
                    Proveer soluciones financieras innovadoras, seguras y accesibles que impulsen el crecimiento económico de nuestros clientes corporativos y personales, garantizando una experiencia bancaria digital de primer nivel.
                  </p>
                </div>
                <div className="content-card">
                  <h3 className="card-title">Transparencia y Confianza</h3>
                  <p className="card-text">
                    Este portal ha sido diseñado específicamente para escuchar tu voz. Nuestro departamento de calidad analiza cada queja registrada para mejorar continuamente nuestros flujos de servicio y atención al cliente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {vistaActiva === 'servicios' && (
            <div className="fade-in">
              <div className="content-header">
                <h1>Nuestros Servicios</h1>
                <p>Soluciones diseñadas para el sector financiero moderno.</p>
              </div>
              <div className="services-grid">
                <div className="service-card" style={{ padding: '30px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Cuentas Corporativas</h4>
                  <p>Gestión de liquidez y pago a proveedores con altos estándares de seguridad y encriptación de datos.</p>
                </div>
                <div className="service-card" style={{ padding: '30px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Fondos de Inversión</h4>
                  <p>Portafolios diversificados y estratégicos administrados por expertos financieros internacionales.</p>
                </div>
                <div className="service-card" style={{ padding: '30px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Créditos Empresariales</h4>
                  <p>Tasas preferenciales y financiamiento estructurado para expansión de negocios e infraestructura.</p>
                </div>
                <div className="service-card" style={{ padding: '30px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Atención Especializada</h4>
                  <p>Soporte técnico 24/7 y seguimiento centralizado en tiempo real de tickets, auditorías y reclamos.</p>
                </div>
              </div>
            </div>
          )}

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