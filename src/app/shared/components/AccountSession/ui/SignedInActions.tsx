import { LogOut } from 'lucide-react';
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
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className="line-clamp-2 min-w-0 text-sm leading-tight font-semibold break-words">{name}</span>
      <button
        type="button"
        aria-label="Salir"
        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-card text-sm font-bold text-foreground transition-colors duration-200 ease-out hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none sm:w-auto sm:px-4"
        onClick={() => {
          void handleLogoutClick();
        }}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
      >
        <LogOut aria-hidden="true" className="size-5" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
