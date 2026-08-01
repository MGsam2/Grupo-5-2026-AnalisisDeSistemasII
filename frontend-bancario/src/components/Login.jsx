import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const manejarSumbit = async (e) => {
    e.preventDefault();
    setMensaje('Conectando al banco...');

    try {
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (respuesta.ok) {
        const token = await respuesta.text();
        localStorage.setItem('token', token);
        setMensaje('¡Login exitoso!');
        
        // Le avisamos a la app que ya puede mostrar el Portal
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setMensaje('Credenciales incorrectas. Intenta de nuevo.');
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje('Error de conexión. ¿Está encendido el API Gateway?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Bienvenido al Banco</h2>
      <p>Inicia sesión para gestionar tus quejas</p>
      
      <form onSubmit={manejarSumbit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Correo Electrónico:</label><br />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>Contraseña:</label><br />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}>
          Ingresar
        </button>
      </form>

      {mensaje && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f8ff', border: '1px solid #0056b3' }}>
          <strong>{mensaje}</strong>
        </div>
      )}
    </div>
  );
}

export default Login;