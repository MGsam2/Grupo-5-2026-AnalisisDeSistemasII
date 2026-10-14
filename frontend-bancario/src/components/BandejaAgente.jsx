import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HistorialMensajes from './HistorialMensajes';

function BandejaAgente({ onLogout }) {
  const [quejas, setQuejas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);



  // Estados para la vista de detalle
  const [detalleActivo, setDetalleActivo] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Estados para la gestión del agente
  const [resolucion, setResolucion] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState({ texto: '', tipo: '' });
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [accionCompletada, setAccionCompletada] = useState(false);

  //refrescar chat
  const [refreshHistorial, setRefreshHistorial] = useState(0);

  const navigate = useNavigate();

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

  // ==========================================
  // CARGAR LISTADO DE ASIGNADAS (1.3.1 y 1.3.2)
  // ==========================================
  useEffect(() => {
    cargarListado();
  }, []);

  const cargarListado = async () => {
    setCargando(true);
    setError(null);
    const token = obtenerToken();

    try {
      // Endpoint solicitado para obtener las asignadas
      const respuesta = await fetch('/api/quejas/mis-asignadas', {
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
          setQuejas([]);
        }
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

  // ==========================================
  // VER DETALLE Y DOCUMENTOS (1.3.3 a 1.3.5)
  // ==========================================
  const verDetalle = async (numeroTicket) => {
    console.log("1. Botón presionado. Buscando ticket:", numeroTicket);

    if (!numeroTicket) {
      setError('Error interno: El número de ticket está vacío.');
      return;
    }

    setCargandoDetalle(true);
    setError(null);
    setResolucion('');
    setMensajeAccion({ texto: '', tipo: '' });
    setAccionCompletada(false);

    const token = obtenerToken();
    const urlConsulta = `/api/quejas/${numeroTicket}`;
    console.log("2. Haciendo petición a la URL:", urlConsulta);

    try {
      const respuesta = await fetch(urlConsulta, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("3. El servidor respondió con el código de estado:", respuesta.status);

      if (respuesta.ok) {
        const data = await respuesta.json();
        console.log("4. Datos recibidos correctamente:", data);
        setDetalleActivo(data);
      } else {
        setError(`Error del servidor: Código ${respuesta.status}`);
      }
    } catch (err) {
      console.error('ERROR FATAL DE RED:', err);
      setError(`Fallo de red o bloqueo CORS: ${err.message}`);
    } finally {
      setCargandoDetalle(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const evento = params.get('event');
    const ticketFirma = params.get('ticketFirma');

    if (evento === 'signing_complete' && ticketFirma) {
      console.log("Retorno de DocuSign detectado para el ticket:", ticketFirma);

      setMensajeAccion({ texto: 'Resolución enviada y firmada con éxito', tipo: 'exito' });
      setAccionCompletada(true);

      verDetalle(ticketFirma);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const abrirDocumento = async (documentoId) => {
    const token = obtenerToken();
    try {
      const respuesta = await fetch(`/api/quejas/documento/${documentoId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!respuesta.ok) {
        alert('No fue posible descargar los documentos'); // FA02
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
      console.error('Error:', error);
      alert('No fue posible descargar los documentos'); // FA02
    }
  };

  // ==========================================
  // FUNCIÓN CENTRALIZADA PARA LAS ACCIONES PUT
  // ==========================================
  const ejecutarAccionAgente = async (tipoAccion, numeroTicket) => {
    // Validación inicial frontend rápida
    if (!resolucion.trim()) {
      setMensajeAccion({ texto: 'Debe ingresar un texto antes de enviar.', tipo: 'error' });
      return;
    }

    setProcesandoAccion(true);
    setMensajeAccion({ texto: 'Procesando operación...', tipo: 'info' });
    const token = obtenerToken();

    // Determinamos la URL y el Body según el botón presionado
    const endpoint = tipoAccion === 'supervisor'
      ? `/api/quejas/${numeroTicket}/enviar-supervisor`
      : `/api/quejas/${numeroTicket}/solicitar-info`;

    const payload = tipoAccion === 'supervisor'
      ? { resolucion: resolucion }
      : { justificacion: resolucion };

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
        // Si el backend envía el JSON exacto de éxito
        const data = await respuesta.json();

        // =================================================================
        if (data.urlFirma) {
          setMensajeAccion({ texto: 'Preparando entorno seguro. Redirigiendo a DocuSign...', tipo: 'info' });

          // Redirige automáticamente al entorno seguro de DocuSign
          window.location.href = data.urlFirma;

          // El return evita que se sigan ejecutando los setTimeouts de abajo, 
          // ya que la página va a cambiar de URL.
          return;
        }
        // =================================================================

        setMensajeAccion({ texto: data.mensaje || 'Operación realizada con éxito', tipo: 'exito' });
        setResolucion('');
        setAccionCompletada(true);


        if (tipoAccion === 'info') {
          // Si pidió info, recargamos el chat y actualizamos el estado visual a Esperando Documentación
          setRefreshHistorial(prev => prev + 1);
          setDetalleActivo(prev => ({
            ...prev,
            queja: { ...prev.queja, estado: 'EsperandoDocumentacion' }
          }));
        } else {
          // Simulamos localmente el cambio de estado antes de recargar para que se bloquee de inmediato
          setDetalleActivo(prev => ({
            ...prev,
            queja: { ...prev.queja, estado: 'EnRevisionSupervisor' }
          }));
          // Si lo mandó al supervisor, lo sacamos al listado en 2.5s
          setTimeout(() => {
            setDetalleActivo(null);
            cargarListado();
          }, 2500);
        }
      } else if (respuesta.status === 400) {
        // Flujo alterno FA08: Resolución Incompleta u otro 400
        const errorMsg = await respuesta.text();
        // Si el backend devuelve texto o un JSON, tratamos de sacar el error limpio
        let textoFinal = "Completa este campo.";
        try {
          const parsed = JSON.parse(errorMsg);
          textoFinal = parsed.error || parsed.mensaje || errorMsg;
        } catch {
          textoFinal = errorMsg; // Si es texto puro
        }
        setMensajeAccion({ texto: textoFinal, tipo: 'error' });

      } else {
        setMensajeAccion({ texto: 'Ocurrió un error inesperado al procesar la solicitud.', tipo: 'error' });
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
      'EnRevisionSupervisor': { bg: '#fed7aa', text: '#c2410c' }
    };
    return estados[clave] || { bg: '#f1f5f9', text: '#475569' };
  };

  // ==========================================
  // RENDERIZADO: VISTA DE DETALLE (1.3.4)
  // ==========================================
  if (detalleActivo && !cargandoDetalle) {
    const { queja, documentos } = detalleActivo;
    const estadoTexto = obtenerTextoCampo(queja.estado) || 'En Validación';
    const numeroTicketReal = obtenerTextoCampo(queja.numeroTicket);
    const nombreCompleto = (queja.usuarioNombre || queja.usuarioApellido)
      ? `${queja.usuarioNombre || ''} ${queja.usuarioApellido || ''}`.trim()
      : (`Nombre: ${queja.clienteNombre}`);
    const estadoTicketLimpiado = estadoTexto.replace(/\s+/g, '');

    const bloqueadoPorEstado = estadoTicketLimpiado !== 'EnValidacion';
    // El bloqueo total considera tanto la petición actual como el estado del ticket
    const controlesBloqueados = procesandoAccion || accionCompletada || bloqueadoPorEstado;

    return (
      <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div className="content-card fade-in" style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Revisión de Caso #{numeroTicketReal}</h2>
            <button
              onClick={() => { setDetalleActivo(null); cargarListado(); }}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Volver a la Bandeja
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>DATOS DEL CLIENTE</p>
              <p style={{ margin: 0, color: '#1e293b', fontWeight: '900' }}>{'Nombre: ' + nombreCompleto}</p>
              <p style={{ margin: 0, color: '#1e293b', fontWeight: '900' }}>{'Correo: ' + queja.usuarioEmail}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>ESTADO ACTUAL</p>
              <span style={{ background: getColorEstado(estadoTexto).bg, color: getColorEstado(estadoTexto).text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                {estadoTexto}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>FECHA DE REGISTRO</p>
              <p style={{ margin: 0, color: '#1e293b', fontWeight: '900' }}>{queja.fechaYHora || queja.fechaCreacion || 'No disponible'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>PRODUCTO RELACIONADO</p>
              <p style={{ margin: 0, color: '#1e293b', fontWeight: '900' }}>{obtenerTextoCampo(queja.producto)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>TÍTULO</p>
              <p style={{ margin: 0, color: '#1e293b', fontWeight: '900' }}>{obtenerTextoCampo(queja.titulo)}</p>
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
                      Visualizar Documento
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Sin documentos de respaldo.</p>
            )}
          </div>

          {/* HISTORIAL DE MENSAJES */}
          <HistorialMensajes
            numeroTicket={numeroTicketReal}
            refreshTrigger={refreshHistorial}
          />

          {/* ÁREA DE GESTIÓN DEL AGENTE */}
          <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '20px', marginTop: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '15px' }}>Gestión del Agente</h3>

            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0', fontWeight: '600' }}>PROPUESTA DE RESOLUCIÓN</p>
            <textarea
              value={resolucion}
              onChange={(e) => setResolucion(e.target.value)}
              placeholder={
                bloqueadoPorEstado
                  ? `El ticket está en estado "${estadoTexto}". No se admiten nuevas resoluciones.`
                  : "Redacte su análisis, propuesta o requerimiento aquí..."
              }
              rows="4"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '15px', fontFamily: 'inherit', resize: 'vertical' }}
              disabled={controlesBloqueados}
            ></textarea>

            {/* MENSAJES DE ESTADO DE LA ACCIÓN */}
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

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => ejecutarAccionAgente('info', numeroTicketReal)}
                disabled={controlesBloqueados}
                style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: controlesBloqueados ? 'not-allowed' : 'pointer', opacity: controlesBloqueados ? 0.7 : 1 }}
              >
                Solicitar Información Adicional
              </button>

              <button
                onClick={() => ejecutarAccionAgente('supervisor', numeroTicketReal)}
                disabled={controlesBloqueados}
                style={{ padding: '10px 20px', background: '#00a8ff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: controlesBloqueados ? 'not-allowed' : 'pointer', opacity: controlesBloqueados ? 0.7 : 1 }}
              >
                Confirmar y Enviar (Traslado a Supervisor)
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZADO: LISTADO PRINCIPAL
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* SIDEBAR BÁSICO DEL AGENTE */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>BCN | Intranet</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Módulo Operativo</p>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px' }}>BANDEJA DE TRABAJO</p>
          <button style={{ width: '100%', textAlign: 'left', padding: '12px', backgroundColor: '#1e293b', border: 'none', color: '#00a8ff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
            Quejas Asignadas
          </button>
        </div>
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={onLogout} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px' }}>
        <div className="content-card fade-in" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>

          <h1 style={{ color: '#0f172a', fontSize: '1.8rem', marginTop: 0 }}>Mi Bandeja de Quejas Asignadas</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Seleccione un caso para revisar la documentación y emitir una resolución.</p>

          {error && (
            <div style={{ padding: '15px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

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
                    const estadoTexto = obtenerTextoCampo(queja.estado) || 'En Validación';

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
                            Ver Detalle
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

export default BandejaAgente;