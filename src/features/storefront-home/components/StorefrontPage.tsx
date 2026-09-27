import type { ReactNode } from 'react';
import '../storefront-home.css';

type StorefrontPageProps = {
  sessionSlot?: ReactNode;
  children?: ReactNode;
};

export function StorefrontPage({ sessionSlot, children }: StorefrontPageProps) {
  return (
    <div className="storefront-page">
      <header className="storefront-header">
        <p className="storefront-brand">Friendly E-Shop</p>
        {sessionSlot ? <div className="storefront-session">{sessionSlot}</div> : null}
      </header>
      <main className="storefront-main">
        {children ?? (
          <>
            <h1>Compra fácil, con una tienda pensada para ti.</h1>
            <p className="storefront-lead">
              Explora el escaparate a tu ritmo. Entrar con Google es opcional y no bloquea la
              visita.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
