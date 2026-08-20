import { useState, useEffect } from 'react';

function VerQuejas() {
  const [quejas, setQuejas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [detalleActivo, setDetalleActivo] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

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

  useEffect(() => {
    cargarListado();
  }, []);

  const cargarListado = async () => {
    setCargando(true);
    setError(null);
    const token = obtenerToken();

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
          setQuejas(data);
        } else {
          console.error("Respuesta no es lista:", data);
          setQuejas([]);
        }
      } else {
        setError('No se pudo obtener el listado de quejas.');
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

  const verDetalle = async (numeroTicketAlfanumerico) => {
    if (!numeroTicketAlfanumerico) {
      setError('Error interno: No se encontró el número de ticket de esta queja.');
      return;
    }

    setCargandoDetalle(true);
    setError(null);
    const token = obtenerToken();

    try {
      const respuesta = await fetch(`/api/quejas/${numeroTicketAlfanumerico}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        setDetalleActivo(data);
      } else {
        setError('No se pudieron cargar los detalles del ticket. Verifique permisos o conexión.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión al intentar obtener los detalles.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  // NUEVA FUNCIÓN: Descarga y visualización de documentos protegidos por JWT
  const abrirDocumento = async (documentoId) => {
    const token = obtenerToken();

    try {
      const respuesta = await fetch(`/api/quejas/documento/${documentoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        alert('El documento no pudo ser recuperado del servidor.');
        return;
      }

      // Convertimos la respuesta física en un Blob
      const blob = await respuesta.blob();
      
      // Creamos una URL local en memoria para el Blob
      const url = URL.createObjectURL(blob);

      // Técnica Anti-Bloqueo de Pop-ups: Usamos un elemento <a> oculto
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank'; // Abrir en nueva pestaña
      document.body.appendChild(link);
      link.click();
      
      // Limpieza de memoria y DOM
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
      console.error('Error al procesar el documento:', error);
      alert('Ocurrió un error al intentar visualizar el documento.');
    }
  };

  const getColorEstado = (estadoTexto) => {
    const clave = estadoTexto ? String(estadoTexto).replace(/\s+/g, '') : '';
    
    const estados = {
      'Registrada': { bg: '#e0f2fe', text: '#0284c7' },
      'EnValidacion': { bg: '#fef08a', text: '#854d0e' },
      'EnRevisionSupervisor': { bg: '#fed7aa', text: '#c2410c' },
      'Aprobada': { bg: '#dcfce7', text: '#166534' },
      'Denegada': { bg: '#fee2e2', text: '#991b1b' },
      'Archivada': { bg: '#f1f5f9', text: '#475569' }
    };
    return estados[clave] || { bg: '#f1f5f9', text: '#475569' };
  };

  const obtenerTextoCampo = (campo) => {
    if (!campo) return null;
    if (typeof campo === 'object' && campo.nombre) {
      return campo.nombre;
    }
    return String(campo);
  };

  // ==========================================
  // RENDERIZADO: VISTA DE DETALLE
  // ==========================================
  if (detalleActivo && !cargandoDetalle) {
    const { queja, documentos } = detalleActivo;
    
    const estadoTexto = obtenerTextoCampo(queja.estado) || 'Registrada';
    const productoTexto = obtenerTextoCampo(queja.producto) || queja.productoNombre || `Producto ID: ${queja.productoId}`;
    const colorEstado = getColorEstado(estadoTexto);
    const numeroTicketReal = obtenerTextoCampo(queja.numeroTicket);

    return (
      <div className="content-card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 className="card-title" style={{ margin: 0, color: '#0f172a' }}>
            Detalle del Ticket #{numeroTicketReal}
          </h2>
          <button 
            onClick={() => setDetalleActivo(null)}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: '500' }}
          >
            ← Volver al listado
          </button>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>TÍTULO</p>
              <p style={{ margin: 0, color: '#1e293b', fontWeight: '500' }}>{obtenerTextoCampo(queja.titulo)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>ESTADO</p>
              <span style={{ 
                background: colorEstado.bg, color: colorEstado.text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600'
              }}>
                {estadoTexto}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>PRODUCTO RELACIONADO</p>
            <p style={{ margin: 0, color: '#1e293b' }}>{productoTexto}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>DESCRIPCIÓN DE LOS HECHOS</p>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.6' }}>
              {obtenerTextoCampo(queja.descripcion)}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>DOCUMENTOS ADJUNTOS</p>
            {documentos && documentos.length > 0 ? (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {documentos.map((doc, index) => {
                  const docId = doc.id || doc.documentoId;
                  const nombreDoc = obtenerTextoCampo(doc.nombreOriginal || doc.nombreArchivo);
                  
                  return (
                    <li key={index} style={{ background: 'white', padding: '10px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#00a8ff', fontSize: '0.9rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>DOC</span> 
                        {nombreDoc}
                      </div>
                      
                      {docId && (
                        <button 
                          onClick={() => abrirDocumento(docId)}
                          style={{ padding: '6px 12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                          Ver Documento
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No se cargaron documentos de respaldo para esta queja.</p>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZADO: VISTA DE LISTADO
  // ==========================================
  return (
    <div className="content-card fade-in">
      <h2 className="card-title" style={{ color: '#0f172a', marginBottom: '8px' }}>Tus quejas registradas</h2>
      <p className="card-text" style={{ color: '#64748b', marginBottom: '30px' }}>
        Historial de tickets generados y su estado actual en la base de datos corporativa.
      </p>

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {cargando || cargandoDetalle ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Recuperando información del servidor...
        </div>
      ) : Array.isArray(quejas) && quejas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
          No hay quejas registradas
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Ticket</th>
                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Título / Asunto</th>
                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '15px', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(quejas) && quejas.map((queja) => {
                const estadoTexto = obtenerTextoCampo(queja.estado) || 'Registrada';
                const tituloTexto = obtenerTextoCampo(queja.titulo);
                const numeroTicketReal = obtenerTextoCampo(queja.numeroTicket);
                const colorEstado = getColorEstado(estadoTexto);
                
                const keyFila = queja.id || numeroTicketReal;
                
                return (
                  <tr key={keyFila} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '15px', color: '#64748b', fontWeight: '500' }}>
                      #{numeroTicketReal}
                    </td>
                    <td style={{ padding: '15px', color: '#1e293b', fontWeight: '500' }}>
                      {tituloTexto}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        background: colorEstado.bg, color: colorEstado.text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600'
                      }}>
                        {estadoTexto}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button 
                        onClick={() => verDetalle(numeroTicketReal)}
                        style={{ padding: '6px 12px', background: '#00a8ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                      >
                        Ver detalles
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
  );
}

export default VerQuejas;