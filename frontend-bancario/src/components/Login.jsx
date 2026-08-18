import { useState } from 'react';
import imagenFondo from '../assets/banca1.png';

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
        const data = await respuesta.json();
        localStorage.setItem('token', data.token); // Guardamos SOLO el string del token
        
        setMensaje('¡Login exitoso!');
        
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
    <div className="split-layout">
      
      <div 
        className="hero-section" 
        style={{ backgroundImage: `url(${imagenFondo})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Bienvenido a Banco Capital Nacional</h1>
          <p>Por favor ingresa tus credenciales para acceder a tu cuenta.</p>
        </div>
      </div>

      <div className="form-section">
        <div className="form-container">
          
          <div className="brand-header">
            <div className="logo-circle">
              <span style={{ fontWeight: 'bold', fontSize: '20px', color: 'white', letterSpacing: '1px' }}>BCN</span>
            </div>
            <div className="brand-text">
              <h2>Banco Capital Nacional</h2>
              <p>Sistema Bancario Digital</p>
            </div>
          </div>

          <form onSubmit={manejarSumbit}>
            
            <div className="input-group">
              <label>Username or Email *</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or Email"
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password *</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Sign In
            </button>
            
          </form>

          {mensaje && (
            <div className="mensaje-sistema">
              {mensaje}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;