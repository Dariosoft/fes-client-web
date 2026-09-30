import { Outlet } from 'react-router-dom';
import { AccountSession } from '../../shared/components/AccountSession/ui/AccountSession';

export function Layout() {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b-4 border-foreground bg-card px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <img className="size-11 shrink-0" src="/favicon.svg" alt="" aria-hidden="true" />
          <p className="font-display text-lg font-semibold tracking-tight text-primary">
            Friendly E-Shop
          </p>
        </div>

        <div className="w-full min-w-0 sm:w-auto sm:max-w-md">
          <AccountSession />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
