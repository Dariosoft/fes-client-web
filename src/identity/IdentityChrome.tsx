import { startLogin } from './login';
import { useIdentity } from './IdentityContext';
import { useIdentitySessionActions } from './useIdentitySessionActions';

/**
 * Minimal identity chrome for the store: Entrar / quién soy / Salir.
 * Does not gate the rest of the store.
 */
export function IdentityChrome() {
  const {
    state,
    loginFailedNotice,
    clearLoginFailedNotice,
  } = useIdentity();
  const { applySuccessfulLogout } = useIdentitySessionActions();

  if (state.status === 'loading') {
    return (
      <header className="identity-chrome" aria-busy="true">
        <p className="identity-chrome__status">Comprobando sesión…</p>
      </header>
    );
  }

  if (state.status === 'identified') {
    return (
      <header className="identity-chrome">
        <div className="identity-chrome__who" aria-live="polite">
          <p className="identity-chrome__label">Sesión iniciada</p>
          <p className="identity-chrome__name">{state.displayName}</p>
          <p className="identity-chrome__email">{state.email}</p>
        </div>
        <button
          type="button"
          className="identity-chrome__button identity-chrome__button--logout"
          onClick={() => {
            void applySuccessfulLogout();
          }}
        >
          Salir
        </button>
      </header>
    );
  }

  return (
    <header className="identity-chrome">
      {loginFailedNotice ? (
        <div className="identity-chrome__notice" role="status">
          <p>{loginFailedNotice}</p>
          <button
            type="button"
            className="identity-chrome__dismiss"
            onClick={clearLoginFailedNotice}
          >
            Cerrar aviso
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="identity-chrome__button"
        onClick={() => {
          clearLoginFailedNotice();
          startLogin();
        }}
      >
        Entrar
      </button>
    </header>
  );
}
