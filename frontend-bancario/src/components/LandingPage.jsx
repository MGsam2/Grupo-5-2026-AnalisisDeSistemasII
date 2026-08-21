import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imagenFondo from '../assets/banca1.png'; 

function LandingPage() {
  const [pestañaActiva, setPestañaActiva] = useState('quienes-somos');
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header style={{ 
        backgroundColor: '#0a192f', 
        padding: '15px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#00a8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
            BCN
          </div>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>Banco Capital Nacional</h1>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/login')}
          style={{ 
            backgroundColor: '#00a8ff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 24px', 
            borderRadius: '4px', 
            fontWeight: '600', 
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0090db'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#00a8ff'}
        >
          Iniciar Sesión
        </button>
      </header>

      {/* SECCIÓN HERO (IMAGEN Y BIENVENIDA) */}
      <section style={{ 
        position: 'relative', 
        height: '400px', 
        backgroundImage: `url(${imagenFondo})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.7)' }}></div>
        <div style={{ position: 'relative', zIndex: 1, color: 'white', maxWidth: '700px', padding: '20px' }}>
          <h2 style={{ fontSize: '3rem', margin: '0 0 15px 0', fontWeight: '700' }}>Solidez y Confianza para su Futuro</h2>
          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', margin: 0, lineHeight: '1.6' }}>
            Descubra un ecosistema financiero diseñado para respaldar el crecimiento de su empresa y la seguridad de su patrimonio.
          </p>
        </div>
      </section>

      {/* MENÚ DE PESTAÑAS INFORMATIVAS */}
      <section style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '40px' }}>
          <button 
            onClick={() => setPestañaActiva('quienes-somos')}
            style={{ 
              background: 'none', border: 'none', padding: '20px 0', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer',
              color: pestañaActiva === 'quienes-somos' ? '#00a8ff' : '#475569',
              borderBottom: pestañaActiva === 'quienes-somos' ? '3px solid #00a8ff' : '3px solid transparent'
            }}
          >
            Quiénes Somos
          </button>
          <button 
            onClick={() => setPestañaActiva('mision-vision')}
            style={{ 
              background: 'none', border: 'none', padding: '20px 0', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer',
              color: pestañaActiva === 'mision-vision' ? '#00a8ff' : '#475569',
              borderBottom: pestañaActiva === 'mision-vision' ? '3px solid #00a8ff' : '3px solid transparent'
            }}
          >
            Misión y Visión
          </button>
          <button 
            onClick={() => setPestañaActiva('servicios')}
            style={{ 
              background: 'none', border: 'none', padding: '20px 0', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer',
              color: pestañaActiva === 'servicios' ? '#00a8ff' : '#475569',
              borderBottom: pestañaActiva === 'servicios' ? '3px solid #00a8ff' : '3px solid transparent'
            }}
          >
            Nuestros Servicios
          </button>
        </div>
      </section>

      {/* ÁREA DE CONTENIDO DINÁMICO */}
      <main style={{ flex: 1, padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '900px', width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
          
          {pestañaActiva === 'quienes-somos' && (
            <div>
              <h3 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '20px' }}>Nuestra Institución</h3>
              <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
                El Banco Capital Nacional (BCN) es una entidad financiera líder, consolidada bajo los más altos estándares de rigor corporativo y cumplimiento normativo. Con décadas de trayectoria en el sector bancario, nos hemos posicionado como el aliado estratégico preferido por corporaciones, instituciones y clientes particulares que exigen excelencia, transparencia y seguridad absoluta en la gestión de su capital.
              </p>
              <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.8' }}>
                Nuestro ecosistema digital de vanguardia garantiza operaciones ágiles y seguras, respaldadas por un equipo de analistas y gestores de patrimonio altamente calificados, comprometidos con la evolución financiera de cada uno de nuestros socios.
              </p>
            </div>
          )}

          {pestañaActiva === 'mision-vision' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#00a8ff', marginBottom: '15px' }}>Nuestra Misión</h3>
                <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1.05rem' }}>
                  Proveer soluciones financieras innovadoras, seguras y accesibles que impulsen el crecimiento económico de nuestros clientes corporativos y personales, garantizando una experiencia bancaria digital de primer nivel y fomentando el desarrollo sostenible del entorno empresarial.
                </p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#00a8ff', marginBottom: '15px' }}>Nuestra Visión</h3>
                <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1.05rem' }}>
                  Ser la institución financiera de referencia a nivel nacional e internacional, reconocida por nuestra solidez estructural, innovación tecnológica, rentabilidad sostenible y por ofrecer el más alto estándar de servicio al cliente en cada interacción.
                </p>
              </div>
            </div>
          )}

          {pestañaActiva === 'servicios' && (
            <div>
              <h3 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '30px', textAlign: 'center' }}>Portafolio Corporativo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#0f172a', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Cuentas Corporativas</h4>
                  <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>Gestión de liquidez y flujos de pago a proveedores con altos estándares de seguridad y encriptación de datos.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#0f172a', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Fondos de Inversión</h4>
                  <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>Portafolios diversificados y estratégicos administrados por expertos financieros internacionales.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#0f172a', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Créditos Empresariales</h4>
                  <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>Tasas preferenciales y financiamiento estructurado para planes de expansión e infraestructura.</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#0f172a', fontSize: '1.2rem', margin: '0 0 15px 0' }}>Gestión de Reclamos</h4>
                  <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>Plataforma integral 24/7 para el registro, trazabilidad y resolución ágil de tickets de soporte.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer style={{ backgroundColor: '#0a192f', padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Banco Capital Nacional, S.A. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}

export default LandingPage;