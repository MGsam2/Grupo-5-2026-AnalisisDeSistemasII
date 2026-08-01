import { useState } from 'react';

function Portal({ onLogout }) {
  // Estado para controlar qué pantalla se ve en el centro
  const [vistaActiva, setVistaActiva] = useState('inicio');

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Menú Lateral (Sidebar) */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ borderBottom: '1px solid #34495e', paddingBottom: '10px' }}>🏦 Mi Banco</h2>
        
        <ul style={{ listStyle: 'none', padding: 0, flexGrow: 1 }}>
          <li style={{ margin: '15px 0' }}>
            <button
              onClick={() => setVistaActiva('registrar')}
              style={{ width: '100%', padding: '10px', textAlign: 'left', backgroundColor: vistaActiva === 'registrar' ? '#34495e' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
            >
              📝 Registrar queja
            </button>
          </li>
          <li style={{ margin: '15px 0' }}>
            <button
              onClick={() => setVistaActiva('ver')}
              style={{ width: '100%', padding: '10px', textAlign: 'left', backgroundColor: vistaActiva === 'ver' ? '#34495e' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
            >
              📂 Quejas creadas
            </button>
          </li>
        </ul>

        <button
          onClick={onLogout}
          style={{ padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
        >
          🚪 Cerrar Sesión
        </button>
      </div>

      {/* Área de Contenido Principal */}
      <div style={{ flex: 1, padding: '40px', backgroundColor: '#ecf0f1' }}>
        
        {vistaActiva === 'inicio' && (
          <div>
            <h1>Portal Informativo</h1>
            <p>Bienvenido al sistema de gestión de quejas. Selecciona una opción del menú de la izquierda para comenzar.</p>
          </div>
        )}

        {vistaActiva === 'registrar' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Registrar una nueva queja</h2>
            <p>Aquí construiremos el formulario para enviar datos al microservicio...</p>
          </div>
        )}

        {vistaActiva === 'ver' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Tus quejas creadas</h2>
            <p>Aquí mostraremos la tabla conectada a la base de datos...</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Portal;