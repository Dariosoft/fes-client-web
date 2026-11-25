import { Outlet } from 'react-router-dom';
import { AccountSession } from '../../shared/components/AccountSession/ui/AccountSession';
import { ProductSearch } from './ProductSearch/ProductSearch';

export function Layout() {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-center gap-x-3 gap-y-3 border-b-4 border-foreground bg-card px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between md:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:order-1 sm:gap-3">
          <img className="size-11 shrink-0" src="/favicon.svg" alt="" aria-hidden="true" />
          <p className="min-w-0 truncate font-display text-sm font-semibold tracking-tight text-primary sm:text-lg">
            Friendly E-Shop
          </p>
        </div>

        <div className="min-w-0 justify-self-end sm:order-3 sm:max-w-md">
          <AccountSession />
        </div>

        <div className="col-span-2 w-full min-w-0 sm:order-2 sm:col-auto sm:w-auto sm:max-w-md sm:flex-1">
          <ProductSearch />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
