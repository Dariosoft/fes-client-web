import { useEffect } from 'react';
import { useIdentity } from './IdentityContext';
import {
  readLoginReturnOutcome,
  stripLoginReturnParams,
} from './loginReturn';
import { useIdentitySessionActions } from './useIdentitySessionActions';

const LOGIN_FAILED_MESSAGE =
  'No se pudo iniciar sesión. Puedes seguir usando la tienda e intentarlo de nuevo.';

/**
 * Handles return from the accounts login flow: success refreshes session;
 * failure/cancel keeps the visitor anonymous and shows a Spanish notice.
 */
export function LoginReturnHandler() {
  const { setAnonymous, showLoginFailedNotice } = useIdentity();
  const { applySuccessfulLogin } = useIdentitySessionActions();

  useEffect(() => {
    const outcome = readLoginReturnOutcome(window.location.search);
    if (outcome === 'none') {
      return;
    }

    const cleanSearch = stripLoginReturnParams(window.location.search);
    const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
    window.history.replaceState(null, '', cleanUrl);

    if (outcome === 'failed') {
      setAnonymous();
      showLoginFailedNotice(LOGIN_FAILED_MESSAGE);
      return;
    }

    void applySuccessfulLogin();
  }, [applySuccessfulLogin, setAnonymous, showLoginFailedNotice]);

  return null;
}
