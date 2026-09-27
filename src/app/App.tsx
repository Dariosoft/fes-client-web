import { SessionChrome } from '../features/account-session';
import { StorefrontPage } from '../features/storefront-home';

export function App() {
  return <StorefrontPage sessionSlot={<SessionChrome />} />;
}
