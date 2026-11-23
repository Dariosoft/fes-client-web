import { LogIn } from 'lucide-react';
import { buildGoogleLoginUrl } from '../../../api/account/build-google-login-url/build-google-login-url';

export function GuestActions() {
  function handleLoginClick() {
    window.location.assign(buildGoogleLoginUrl(window.location.origin));
  }

  return (
    <button
      type="button"
      aria-label="Entrar con Google"
      className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-on-accent transition-colors duration-200 ease-out hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:w-auto sm:px-4"
      onClick={handleLoginClick}
    >
      <LogIn aria-hidden="true" className="size-5" />
      <span className="hidden sm:inline">Entrar con Google</span>
    </button>
  );
}
