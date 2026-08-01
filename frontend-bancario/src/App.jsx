import { useState, useEffect } from 'react';
import Login from './components/Login';
import Portal from './components/Portal';

function App() {
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  // Al cargar la app, revisamos si ya hay un token guardado previamente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setEstaAutenticado(true);
    }
  }, []);

  const manejarCierreSesion = () => {
    localStorage.removeItem('token'); // Borramos el token
    setEstaAutenticado(false); // Regresamos al Login
  };

  // Si está autenticado, mostramos el Portal. Si no, mostramos el Login.
  if (estaAutenticado) {
    return <Portal onLogout={manejarCierreSesion} />;
  }

  return <Login onLoginSuccess={() => setEstaAutenticado(true)} />;
}

export default App;