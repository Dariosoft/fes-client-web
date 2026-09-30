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
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
      <span className="text-sm font-semibold break-words">{name}</span>
      <button
        type="button"
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-foreground bg-card px-4 text-sm font-bold text-foreground transition-colors duration-200 ease-out hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none sm:w-auto"
        onClick={() => {
          void handleLogoutClick();
        }}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
      >
        Salir
      </button>
    </div>
  );
}
