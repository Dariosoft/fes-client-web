import { ACCOUNT_PARAMS } from '../../../../api/account/constants';

export function consumeLoginErrorFromUrl(
  search: string = window.location.search,
  historyApi: Pick<History, 'replaceState'> = window.history,
  locationHref: string = window.location.href,
): boolean {
  const params = new URLSearchParams(search);
  const hasLoginError = params.get(ACCOUNT_PARAMS.loginError) === '1';

  if (!hasLoginError) {
    return false;
  }

  params.delete(ACCOUNT_PARAMS.loginError);

  const url = new URL(locationHref);
  const nextSearch = params.toString();
  url.search = nextSearch.length > 0 ? `?${nextSearch}` : '';

  historyApi.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);

  return true;
}
