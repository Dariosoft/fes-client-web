import { PUBLICATION_DETAIL_COPY } from '../../constants';

type PublicationDetailStatusProps =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; onRetry: () => void };

function PublicationDetailLoading() {
  return (
    <div role="status" aria-live="polite" className="w-full">
      <h1 className="sr-only">{PUBLICATION_DETAIL_COPY.loading}</h1>
      <div aria-hidden="true" className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        <div className="aspect-square w-full rounded-2xl bg-muted" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-7 w-1/3 rounded bg-muted" />
          <div className="h-5 w-1/2 rounded bg-muted" />
          <div className="h-24 w-full rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

function PublicationDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-destructive bg-card px-6 py-12 text-center"
    >
      <h1 className="font-display text-lg font-semibold text-foreground">
        {PUBLICATION_DETAIL_COPY.errorTitle}
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        {PUBLICATION_DETAIL_COPY.errorMessage}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 font-bold text-on-primary transition-colors duration-200 ease-out hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
      >
        {PUBLICATION_DETAIL_COPY.retry}
      </button>
    </div>
  );
}

function PublicationDetailNotFound() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card px-6 py-12 text-center">
      <h1 className="font-display text-lg font-semibold text-foreground">
        {PUBLICATION_DETAIL_COPY.notFoundTitle}
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        {PUBLICATION_DETAIL_COPY.notFoundMessage}
      </p>
    </div>
  );
}

export function PublicationDetailStatus(props: PublicationDetailStatusProps) {
  if (props.status === 'error') {
    return <PublicationDetailError onRetry={props.onRetry} />;
  }

  if (props.status === 'not-found') {
    return <PublicationDetailNotFound />;
  }

  return <PublicationDetailLoading />;
}
