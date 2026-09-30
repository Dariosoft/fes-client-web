import { buildGoogleLoginUrl } from '../../../api/account/build-google-login-url/build-google-login-url';

export function GuestActions() {
  function handleLoginClick() {
    window.location.assign(buildGoogleLoginUrl(window.location.origin));
  }

  return (
    <button
      type="button"
      className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-accent px-4 text-sm font-bold text-on-accent transition-colors duration-200 ease-out hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:w-auto"
      onClick={handleLoginClick}
    >
      Entrar con Google
    </button>
  );
}
