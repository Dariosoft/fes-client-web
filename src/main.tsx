import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://api.friendly-e-shop.local';

function App() {
  return (
    <main>
      <p className="eyebrow">Friendly E-Shop</p>
      <h1>Una tienda simple para empezar a vender.</h1>
      <p className="lead">El storefront está listo. El catálogo se conectará en el siguiente incremento funcional.</p>
      <a href={`${apiBaseUrl}/catalog`}>Comprobar catálogo</a>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
