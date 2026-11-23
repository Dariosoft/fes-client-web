import { Search } from 'lucide-react';
import { useId, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CATALOG_SEARCH_MAX_LENGTH,
  CATALOG_SEARCH_PARAMS,
  normalizeCatalogSearchTerm,
} from '../../../shared/config/catalog-search';

function readSubmittedTerm(form: HTMLFormElement): string {
  const submittedValue = new FormData(form).get(CATALOG_SEARCH_PARAMS.name);

  return normalizeCatalogSearchTerm(typeof submittedValue === 'string' ? submittedValue : '');
}

export function ProductSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputId = useId();
  const appliedTerm = normalizeCatalogSearchTerm(searchParams.get(CATALOG_SEARCH_PARAMS.name) ?? '');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = readSubmittedTerm(event.currentTarget);
    const nextParams = new URLSearchParams();
    nextParams.set(CATALOG_SEARCH_PARAMS.page, '1');

    if (term !== '') {
      nextParams.set(CATALOG_SEARCH_PARAMS.name, term);
    }

    const activeSize = searchParams.get(CATALOG_SEARCH_PARAMS.size);

    if (activeSize !== null) {
      nextParams.set(CATALOG_SEARCH_PARAMS.size, activeSize);
    }

    void navigate({ pathname: '/', search: nextParams.toString() });
  }

  return (
    <form
      role="search"
      aria-label="Buscar productos"
      className="flex w-full items-center gap-2"
      onSubmit={handleSubmit}
    >
      <label htmlFor={inputId} className="sr-only">
        Buscar productos por nombre
      </label>
      <input
        id={inputId}
        key={appliedTerm}
        type="search"
        name={CATALOG_SEARCH_PARAMS.name}
        defaultValue={appliedTerm}
        maxLength={CATALOG_SEARCH_MAX_LENGTH}
        placeholder="Buscar productos"
        autoComplete="off"
        className="min-h-11 w-full min-w-0 rounded-xl border-2 border-border bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-foreground bg-card text-foreground transition-colors duration-200 ease-out hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
      >
        <Search aria-hidden="true" className="size-5" />
      </button>
    </form>
  );
}
