import type { PublicShop } from '../../../../shared/api/account/types';
import { PUBLICATION_DETAIL_COPY } from '../../constants';

type PublicationShopProps = {
  shop: PublicShop | null;
};

export function PublicationShop({ shop }: PublicationShopProps) {
  if (shop === null) {
    return null;
  }

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4">
      <h2 className="font-display text-base font-semibold text-foreground">
        {PUBLICATION_DETAIL_COPY.shopTitle}
      </h2>
      <p className="mt-1 min-w-0 break-words text-base text-foreground">{shop.name}</p>
    </section>
  );
}
