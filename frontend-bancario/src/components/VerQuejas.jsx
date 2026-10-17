import { useState, useEffect } from 'react';
import HistorialMensajes from './HistorialMensajes';

function VerQuejas() {
  const [quejas, setQuejas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [detalleActivo, setDetalleActivo] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [refreshHistorial, setRefreshHistorial] = useState(0);
  const [mensajeRespuesta, setMensajeRespuesta] = useState('');
  const [archivoRespuesta, setArchivoRespuesta] = useState(null);
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  const nombreParaMostrar = "Agente Operativo";
  const iniciales = "AG";

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
    setMensaje({ texto: '', tipo: '' });
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


  const manejarCambioArchivo = (e) => {
    setMensaje({ texto: '', tipo: '' }); // Limpiamos errores previos
    const file = e.target.files[0];

    if (file) {
      const tamanoMaximo = 2 * 1024 * 1024; // 2 MB en bytes
      if (file.size > tamanoMaximo) {
        setMensaje({ texto: 'Error: El archivo no debe superar los 2 MB de tamaño.', tipo: 'error' });
        e.target.value = ''; // Resetea el input para que no se quede guardado
        setArchivoRespuesta(null);
        return;
      }
      setArchivoRespuesta(file);
    } else {
      setArchivoRespuesta(null);
    }
  };

  // --- NUEVA FUNCIÓN: ENVIAR RESPUESTA DEL CLIENTE ---
  const enviarRespuestaCliente = async (numeroTicket) => {
    if (!mensajeRespuesta.trim()) {
      setMensaje({ texto: 'Debe escribir un mensaje.', tipo: 'error' });
      return;
    }

    setEnviandoRespuesta(true);
    setMensaje({ texto: 'Enviando respuesta y adjuntos...', tipo: 'info' });
    const token = obtenerToken();
    const formData = new FormData();
    formData.append('mensaje', mensajeRespuesta);

    if (archivoRespuesta) {
      formData.append('archivo', archivoRespuesta);
    }

    try {
      const respuesta = await fetch(`/api/quejas/${numeroTicket}/responder`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Sin Content-Type por usar FormData
        body: formData
      });

      if (!respuesta.ok) {
        if (respuesta.status === 413) {
          setMensaje({ texto: 'Error: El documento supera el límite del servidor (2 MB).', tipo: 'error' });
          return;
        }
        const errorDelBackend = await respuesta.text();
        setMensaje({ texto: errorDelBackend || 'Error al enviar la respuesta.', tipo: 'error' });
        return;
      }

      const data = await respuesta.json();

      // Mostramos el mensaje de éxito que viene del backend (en verde)
      setMensaje({ texto: data.mensaje || 'Respuesta enviada correctamente.', tipo: 'exito' });
      setMensajeRespuesta('');
      setArchivoRespuesta(null);
      setRefreshHistorial(prev => prev + 1);

      // Actualizamos visualmente el estado para que el formulario desaparezca
      setDetalleActivo(prev => ({
        ...prev,
        queja: { ...prev.queja, estado: 'EnValidacion' }
      }));

      setTimeout(() => {
        verDetalle(numeroTicket);
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setMensaje({ texto: 'Error de red al enviar la respuesta.', tipo: 'error' });
    } finally {
      setEnviandoRespuesta(false);
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
    const { queja, documentos, quejasRelacionadas } = detalleActivo;
    const estadoTexto = obtenerTextoCampo(queja.estado) || 'Registrada';
    const productoTexto = obtenerTextoCampo(queja.producto) || queja.productoNombre || `Producto ID: ${queja.productoId}`;
    const colorEstado = getColorEstado(estadoTexto);
    const numeroTicketReal = obtenerTextoCampo(queja.numeroTicket);

    return (
      <div className="content-card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 className="card-title" style={{ margin: 0, color: '#0f172a' }}>
            Detalle de la Queja #{numeroTicketReal}
          </h2>
          <button
            onClick={() => { setDetalleActivo(null); cargarListado(); }}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: '500' }}
          >
            ← Volver al listado
          </button>
        </div>

        {/* BANNER DE TICKET PADRE */}
        {queja.numeroTicketPadre && (
          <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '12px 15px', borderRadius: '6px', marginBottom: '25px', color: '#0369a1', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔗</span>
            <span>Queja derivada de la Queja <strong>{queja.numeroTicketPadre}</strong></span>
          </div>
        )}

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

          {/* TABLA DE TICKETS DERIVADOS (HIJOS) */}
          {quejasRelacionadas && quejasRelacionadas.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>TICKETS DERIVADOS (RELACIONADOS)</p>
              <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 15px', color: '#475569', fontWeight: '600' }}>No. Ticket</th>
                      <th style={{ padding: '12px 15px', color: '#475569', fontWeight: '600' }}>Estado Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quejasRelacionadas.map((relacionada, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: '500' }}>
                          #{relacionada.numeroTicket}
                        </td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            {obtenerTextoCampo(relacionada.estado)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* AQUÍ COMIENZA LA INTEGRACIÓN DEL CHAT Y EL FORMULARIO     */}
          {/* ========================================================= */}

          <HistorialMensajes numeroTicket={numeroTicketReal} refreshTrigger={refreshHistorial} />

          {/* Mostrar formulario SÓLO si el banco está pidiendo información */}
          {estadoTexto.replace(/\s+/g, '') === 'EsperandoDocumentacion' && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0369a1', margin: '0 0 10px 0' }}>Se requiere su respuesta</h3>
              <p style={{ fontSize: '0.9rem', color: '#0284c7', marginBottom: '15px' }}>
                El agente bancario ha solicitado información adicional para continuar con su gestión.
              </p>

              <textarea
                value={mensajeRespuesta}
                onChange={(e) => setMensajeRespuesta(e.target.value)}
                maxLength={120}
                placeholder="Escriba su respuesta detallada aquí..."
                rows="4"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #7dd3fc', marginBottom: '10px', fontFamily: 'inherit', resize: 'vertical' }}
              ></textarea>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <input
                  type="file"
                  accept="image/jpeg, application/pdf"
                  onChange={manejarCambioArchivo}
                  style={{ fontSize: '0.85rem', cursor: 'pointer' }}
                />
                <button
                  onClick={() => enviarRespuestaCliente(numeroTicketReal)}
                  disabled={enviandoRespuesta}
                  style={{ padding: '10px 20px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: enviandoRespuesta ? 'not-allowed' : 'pointer', opacity: enviandoRespuesta ? 0.7 : 1 }}
                >
                  {enviandoRespuesta ? 'Enviando...' : 'Enviar Respuesta y Documento'}
                </button>
              </div>
            </div>
          )}
          {/* ========================================================= */}


          {/* MENSAJES DE ESTADO */}
          {mensaje.texto && (
            <div className="fade-in" style={{
              marginTop: '15px', padding: '14px', borderRadius: '6px', textAlign: 'center', fontWeight: '500', fontSize: '0.95rem',
              backgroundColor: mensaje.tipo === 'exito' ? '#f0fdf4' : mensaje.tipo === 'error' ? '#fef2f2' : '#f0f9ff',
              color: mensaje.tipo === 'exito' ? '#166534' : mensaje.tipo === 'error' ? '#991b1b' : '#0369a1',
              border: `1px solid ${mensaje.tipo === 'exito' ? '#bbf7d0' : mensaje.tipo === 'error' ? '#fecaca' : '#bae6fd'}`
            }}>
              {mensaje.texto}
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZADO: VISTA DE LISTADO
  // ==========================================
  return (
    <div className="content-card fade-in">
      <h1 style={{ color: '#0f172a', fontSize: '1.8rem', marginTop: 0 }}>Tus quejas registradas</h1>
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