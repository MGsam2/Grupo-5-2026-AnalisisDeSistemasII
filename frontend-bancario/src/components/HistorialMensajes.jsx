import { useState, useEffect } from 'react';

function HistorialMensajes({ numeroTicket, refreshTrigger }) {
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);

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
        if (!numeroTicket) return;

        const cargarMensajes = async () => {
            setCargando(true);
            const token = obtenerToken();

            try {
                const respuesta = await fetch(`/api/quejas/${numeroTicket}/mensajes`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (respuesta.ok) {
                    const data = await respuesta.json();
                    setMensajes(Array.isArray(data) ? data : []);
                } else {
                    console.error("Error al obtener historial de mensajes");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarMensajes();
    }, [numeroTicket, refreshTrigger]); // refreshTrigger permite recargar el chat desde el componente padre

    if (cargando) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando historial de conversación...</div>;
    }

    if (mensajes.length === 0) {
        return null; // Si no hay mensajes, no mostramos nada
    }

    return (
        <div style={{ marginTop: '20px', marginBottom: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '15px' }}>Historial de Conversación</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {mensajes.map((msg) => {
                    const esCliente = msg.rolRemitente === 'CLIENTE';

                    return (
                        <div key={msg.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: esCliente ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                maxWidth: '80%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                backgroundColor: esCliente ? '#00a8ff' : '#f1f5f9',
                                color: esCliente ? 'white' : '#1e293b',
                                borderBottomRightRadius: esCliente ? '0' : '8px',
                                borderBottomLeftRadius: esCliente ? '8px' : '0'
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px', color: esCliente ? '#e0f2fe' : '#64748b' }}>
                                    {esCliente ? 'TÚ' : 'AGENTE BANCARIO'}
                                </div>
                                <div style={{ fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                    {msg.mensaje}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                {new Date(msg.fechaHora).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default HistorialMensajes;