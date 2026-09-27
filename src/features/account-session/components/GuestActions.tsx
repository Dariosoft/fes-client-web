import { buildGoogleLoginUrl } from '../api/build-google-login-url';

export function GuestActions() {
  function handleLoginClick() {
    window.location.assign(buildGoogleLoginUrl(window.location.origin));
  }

  return (
    <button type="button" className="session-action" onClick={handleLoginClick}>
      Entrar con Google
    </button>
  );
}
