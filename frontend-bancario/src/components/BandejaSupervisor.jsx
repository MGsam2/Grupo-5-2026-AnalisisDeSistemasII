import { useState, useEffect } from 'react';
import HistorialMensajes from './HistorialMensajes'; 

function BandejaSupervisor({ onLogout }) {
  // Estados para el listado y estadísticas
  const [quejas, setQuejas] = useState([]);
  const [estadisticasTexto, setEstadisticasTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para la vista de detalle
  const [detalleActivo, setDetalleActivo] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  
  // Estados para la gestión del supervisor
  const [observaciones, setObservaciones] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState({ texto: '', tipo: '' });
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [accionCompletada, setAccionCompletada] = useState(false);
  
  // Estado para refrescar el chat
  const [refreshHistorial, setRefreshHistorial] = useState(0);

  const obtenerToken = () => {
    let tokenString = localStorage.getItem('token');
    if (tokenString && tokenString.startsWith('{')) {
      try {
        const tokenObj = JSON.parse(tokenString);
        return tokenObj.token || tokenString;
      } catch (err) { return tokenString; }
    }
    return tokenString;
  };

  const obtenerTextoCampo = (campo) => {
    if (!campo) return '';
    if (typeof campo === 'object' && campo.nombre) return campo.nombre;
    return String(campo);
  };

  // Carga inicial del Dashboard
  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setCargando(true);
    setError(null);
    const token = obtenerToken();

    try {
      // 1. Obtener Estadísticas / Bienvenida
      try {
        const resStats = await fetch('/api/quejas/supervisor/estadisticas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resStats.ok) {
          const dataStats = await resStats.json();
          setEstadisticasTexto(dataStats.mensajeBienvenida || dataStats.mensaje || 'Bienvenido a su bandeja.');
        }
      } catch (e) {
        console.warn("No se pudieron cargar las estadísticas", e);
      }

      // 2. Obtener Listado de Pendientes
      const resLista = await fetch('/api/quejas/supervisor/pendientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resLista.ok) {
        const dataLista = await resLista.json();
        setQuejas(Array.isArray(dataLista) ? dataLista : []);
      } else {
        setError('No se pudo obtener la bandeja de asignaciones.');
        setQuejas([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor.');
      setQuejas([]);
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (numeroTicket) => {
    setCargandoDetalle(true);
    setError(null);
    setObservaciones(''); 
    setMensajeAccion({ texto: '', tipo: '' }); 
    setAccionCompletada(false); 
    
    const token = obtenerToken();

    try {
      const respuesta = await fetch(`/api/quejas/${numeroTicket}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        setDetalleActivo(data);
      } else {
        setError('No se pudieron cargar los detalles del ticket.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión al intentar obtener los detalles.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const abrirDocumento = async (documentoId) => {
    const token = obtenerToken();
    try {
      const respuesta = await fetch(`/api/quejas/documento/${documentoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!respuesta.ok) {
        alert('No fue posible descargar los documentos');
        return;
      }

      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      alert('No fue posible descargar los documentos');
    }
  };

  const ejecutarAccionSupervisor = async (tipoAccion, numeroTicket) => {
    if (!observaciones.trim()) {
      setMensajeAccion({ texto: 'Debe ingresar sus observaciones antes de continuar.', tipo: 'error' });
      return;
    }

    setProcesandoAccion(true);
    setMensajeAccion({ texto: 'Procesando operación...', tipo: 'info' });
    const token = obtenerToken();

    // Determinamos el endpoint según la decisión del supervisor
    const endpoint = tipoAccion === 'jefe' 
      ? `/api/quejas/${numeroTicket}/enviar-jefe`
      : `/api/quejas/${numeroTicket}/devolver-agente`;

    const payload = { observaciones: observaciones };

    try {
      const respuesta = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        setMensajeAccion({ texto: data.mensaje || 'Operación realizada con éxito.', tipo: 'exito' });
        setObservaciones(''); 
        setAccionCompletada(true); 
        
        // Simular el cambio visual temporalmente para que se bloqueen los botones
        const nuevoEstado = tipoAccion === 'jefe' ? 'EnRevisionJefe' : 'EnValidacion';
        setDetalleActivo(prev => ({
          ...prev,
          queja: { ...prev.queja, estado: nuevoEstado }
        }));

        setTimeout(() => {
          setDetalleActivo(null);
          cargarDashboard();
        }, 2500);

      } else {
        const errorMsg = await respuesta.text();
        let textoFinal = "Error al procesar la solicitud."; 
        try {
          const parsed = JSON.parse(errorMsg);
          textoFinal = parsed.error || parsed.mensaje || errorMsg;
        } catch { textoFinal = errorMsg; }
        setMensajeAccion({ texto: textoFinal, tipo: 'error' });
      }
    } catch (error) {
      console.error('Error al procesar acción:', error);
      setMensajeAccion({ texto: 'Error de red. Verifique su conexión al servidor.', tipo: 'error' });
    } finally {
      setProcesandoAccion(false);
    }
  };

  const getColorEstado = (estadoTexto) => {
    const clave = estadoTexto ? String(estadoTexto).replace(/\s+/g, '') : '';
    const estados = {
      'EnValidacion': { bg: '#fef08a', text: '#854d0e' },
      'EnRevisionSupervisor': { bg: '#fed7aa', text: '#c2410c' },
      'EnRevisionJefe': { bg: '#e9d5ff', text: '#6b21a8' },
      'EsperandoDocumentacion': { bg: '#fee2e2', text: '#991b1b' }
    };
    return estados[clave] || { bg: '#f1f5f9', text: '#475569' };
  };

  // ==========================================
  // RENDERIZADO: VISTA DE DETALLE
  // ==========================================
  if (detalleActivo && !cargandoDetalle) {
    const { queja, documentos } = detalleActivo;
    const estadoTexto = obtenerTextoCampo(queja.estado) || 'Registrada';
    const numeroTicketReal = obtenerTextoCampo(queja.numeroTicket);

    const nombreCompleto = (queja.usuarioNombre || queja.usuarioApellido)
      ? `${queja.usuarioNombre || ''} ${queja.usuarioApellido || ''}`.trim()
      : (queja.clienteNombre || `Usuario ID: ${queja.idUsuario}`);

    // Regla FA07: Bloqueo si el estado NO es EnRevisionSupervisor
    const estadoTicketLimpiado = estadoTexto.replace(/\s+/g, '');
    const bloqueadoPorEstado = estadoTicketLimpiado !== 'EnRevisionSupervisor';
    const controlesBloqueados = procesandoAccion || accionCompletada || bloqueadoPorEstado;

    return (
      <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div className="content-card fade-in" style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Revisión de Caso #{numeroTicketReal}</h2>
            <button 
              onClick={() => { setDetalleActivo(null); cargarDashboard(); }}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Volver al listado
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>DATOS DEL CLIENTE</p>
              <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', textTransform: 'capitalize' }}>{nombreCompleto}</p>
              {queja.contactoUsuario && <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>{queja.contactoUsuario}</p>}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>ESTADO ACTUAL</p>
              <span style={{ background: getColorEstado(estadoTexto).bg, color: getColorEstado(estadoTexto).text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                {estadoTexto}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>FECHA DE REGISTRO</p>
              <p style={{ margin: 0, color: '#1e293b' }}>{queja.fechaYHora || queja.fechaCreacion || 'No disponible'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>TÍTULO / ASUNTO</p>
              <p style={{ margin: 0, color: '#1e293b' }}>{obtenerTextoCampo(queja.titulo)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>DESCRIPCIÓN DE LOS HECHOS</p>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155' }}>
              {obtenerTextoCampo(queja.descripcion)}
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>DOCUMENTOS ADJUNTOS</p>
            {documentos && documentos.length > 0 ? (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {documentos.map((doc, index) => (
                  <li key={index} style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '500' }}>📄 {obtenerTextoCampo(doc.nombreOriginal || doc.nombreArchivo)}</span>
                    <button onClick={() => abrirDocumento(doc.id || doc.documentoId)} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>
                      Descargar Documento
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Sin documentos de respaldo.</p>
            )}
          </div>

          {/* HISTORIAL DE MENSAJES (CHAT) */}
          <HistorialMensajes numeroTicket={numeroTicketReal} refreshTrigger={refreshHistorial} />

          {/* ÁREA DE GESTIÓN DEL SUPERVISOR */}
          <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '20px', marginTop: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '15px' }}>Gestión del Supervisor</h3>
            
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>OBSERVACIONES DE REVISIÓN</p>
            
            <textarea 
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder={
                bloqueadoPorEstado 
                  ? `Modo lectura. El ticket está en estado "${estadoTexto}".` 
                  : "Redacte sus observaciones aquí..."
              }
              rows="4"
              maxLength={500}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', 
                marginBottom: '5px', fontFamily: 'inherit', resize: 'vertical',
                backgroundColor: controlesBloqueados ? '#f1f5f9' : 'white',
                boxSizing: 'border-box'
              }}
              disabled={controlesBloqueados}
            ></textarea>
            
            {/* Contador de caracteres */}
            {!controlesBloqueados && (
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: observaciones.length === 500 ? '#ef4444' : '#94a3b8', marginBottom: '15px' }}>
                {observaciones.length}/500 caracteres
              </div>
            )}

            {mensajeAccion.texto && (
              <div style={{ 
                marginBottom: '15px', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500',
                backgroundColor: mensajeAccion.tipo === 'error' ? '#fef2f2' : mensajeAccion.tipo === 'exito' ? '#f0fdf4' : '#f0f9ff',
                color: mensajeAccion.tipo === 'error' ? '#991b1b' : mensajeAccion.tipo === 'exito' ? '#166534' : '#0369a1',
                border: `1px solid ${mensajeAccion.tipo === 'error' ? '#fecaca' : mensajeAccion.tipo === 'exito' ? '#bbf7d0' : '#bae6fd'}`
              }}>
                {mensajeAccion.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => ejecutarAccionSupervisor('agente', numeroTicketReal)}
                disabled={controlesBloqueados}
                style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: controlesBloqueados ? 'not-allowed' : 'pointer', opacity: controlesBloqueados ? 0.6 : 1 }}
              >
                Devolver al Agente
              </button>
              
              <button 
                onClick={() => ejecutarAccionSupervisor('jefe', numeroTicketReal)}
                disabled={controlesBloqueados}
                style={{ padding: '10px 20px', background: '#00a8ff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: controlesBloqueados ? 'not-allowed' : 'pointer', opacity: controlesBloqueados ? 0.6 : 1 }}
              >
                Confirmar y Enviar (Traslado a Jefe)
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZADO: LISTADO PRINCIPAL (DASHBOARD)
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>BCN | Intranet</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Módulo Operativo - Supervisor</p>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px' }}>PANEL DE CONTROL</p>
          <button style={{ width: '100%', textAlign: 'left', padding: '12px', backgroundColor: '#1e293b', border: 'none', color: '#00a8ff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
            Revisión de Quejas
          </button>
        </div>
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={onLogout} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px' }}>
        
        {/* Banner de Bienvenida / Estadísticas */}
        {estadisticasTexto && (
          <div className="fade-in" style={{ backgroundColor: '#00a8ff', color: 'white', padding: '20px 30px', borderRadius: '8px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Resumen Operativo</h2>
              <p style={{ margin: 0, opacity: 0.9 }}>{estadisticasTexto}</p>
            </div>
          </div>
        )}

        <div className="content-card fade-in" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: '#0f172a', fontSize: '1.8rem', marginTop: 0 }}>Quejas Pendientes de Revisión</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Seleccione un caso enviado por el equipo de agentes para su respectiva auditoría y escalamiento.</p>

          {error && <div style={{ padding: '15px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

          {cargando ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Sincronizando con el servidor...</div>
          ) : quejas.length === 0 ? (
            // Mensaje Exacto del Flujo Alterno (FA01)
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: '500' }}>
              No existen quejas pendientes de revisión
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>No. Ticket</th>
                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Título</th>
                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Fecha</th>
                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Estado</th>
                    <th style={{ padding: '15px', textAlign: 'right', color: '#475569', fontWeight: '600' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {quejas.map((queja) => {
                    const idTicket = obtenerTextoCampo(queja.numeroTicket) || queja.id;
                    const estadoTexto = obtenerTextoCampo(queja.estado) || 'En Revisión Supervisor';
                    
                    return (
                      <tr key={idTicket} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px', color: '#64748b', fontWeight: '500' }}>#{idTicket}</td>
                        <td style={{ padding: '15px', color: '#1e293b', fontWeight: '500' }}>{obtenerTextoCampo(queja.titulo)}</td>
                        <td style={{ padding: '15px', color: '#64748b' }}>{queja.fechaYHora || queja.fechaCreacion || '-'}</td>
                        <td style={{ padding: '15px' }}>
                          <span style={{ background: getColorEstado(estadoTexto).bg, color: getColorEstado(estadoTexto).text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            {estadoTexto}
                          </span>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <button 
                            onClick={() => verDetalle(idTicket)}
                            style={{ padding: '6px 12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Revisar Expediente
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default BandejaSupervisor;