import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { PublicShop } from '../../shared/api/account/types';
import type { PublicationDetail as PublicationDetailData } from '../../shared/api/catalog/types';
import {
  buildCatalogHref,
  readCatalogReturnState,
} from '../../shared/lib/catalog-location/catalog-location';
import { formatPrice } from '../../shared/lib/format-price/format-price';
import { PublicationDetailStatus } from './components/PublicationDetailStatus/PublicationDetailStatus';
import { PublicationGallery } from './components/PublicationGallery/PublicationGallery';
import { PublicationShop } from './components/PublicationShop/PublicationShop';
import { PUBLICATION_DETAIL_COPY } from './constants';
import { usePublicationDetail } from './hooks/use-publication-detail/use-publication-detail';
import { formatStockLabel } from './lib/format-stock-label/format-stock-label';

type PublicationDetailContentProps = {
  publication: PublicationDetailData;
  shop: PublicShop | null;
};

const BACK_LINK_CLASS =
  'inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border-2 border-border bg-card px-4 font-display text-sm font-semibold text-foreground transition-colors duration-200 ease-out hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none';

function PublicationDetailContent({ publication, shop }: PublicationDetailContentProps) {
  const description =
    publication.description === null || publication.description.trim() === ''
      ? PUBLICATION_DETAIL_COPY.missingDescription
      : publication.description;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
      <div className="min-w-0">
        <PublicationGallery images={publication.images} productName={publication.name} />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <h1 className="min-w-0 break-words font-display text-2xl font-bold text-foreground sm:text-3xl">
          {publication.name}
        </h1>

        <p className="font-display text-2xl font-bold text-foreground">
          {formatPrice(publication.price, publication.currency)}
        </p>

        <p className="text-base font-semibold text-muted-foreground">
          {formatStockLabel(publication.stock)}
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-base font-semibold text-foreground">
            {PUBLICATION_DETAIL_COPY.descriptionTitle}
          </h2>
          <p className="whitespace-pre-line break-words text-base text-foreground">{description}</p>
        </section>

        <PublicationShop shop={shop} />
      </div>
    </div>
  );
}

export function PublicationDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const from = readCatalogReturnState(location.state as unknown);
  const backHref = from === null ? '/' : buildCatalogHref(from);
  const { state, retry } = usePublicationDetail(id);

  return (
    <section
      aria-label={PUBLICATION_DETAIL_COPY.sectionLabel}
      className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-14"
    >
      <div className="flex flex-col gap-6">
        <Link to={backHref} className={BACK_LINK_CLASS}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          {PUBLICATION_DETAIL_COPY.backToCatalog}
        </Link>

        {state.status === 'loading' ? <PublicationDetailStatus status="loading" /> : null}
        {state.status === 'not-found' ? <PublicationDetailStatus status="not-found" /> : null}
        {state.status === 'error' ? (
          <PublicationDetailStatus status="error" onRetry={retry} />
        ) : null}
        {state.status === 'success' ? (
          <PublicationDetailContent publication={state.publication} shop={state.shop} />
        ) : null}
      </div>
    </section>
  );
}
