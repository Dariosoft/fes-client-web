import { useState } from 'react';

type SignedInActionsProps = {
  name: string;
  onLogout: () => Promise<void>;
};

export function SignedInActions({ name, onLogout }: SignedInActionsProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogoutClick() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await onLogout();
    } catch {
      // Keep authenticated UI when logout fails; do not pretend signed-out.
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="signed-in-actions">
      <span className="session-name">{name}</span>
      <button
        type="button"
        className="session-action"
        onClick={() => {
          void handleLogoutClick();
        }}
        disabled={isLoggingOut}
      >
        Salir
      </button>
    </div>
  );
}
