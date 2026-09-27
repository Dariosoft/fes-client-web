import { useAccountSession } from '../hooks/use-account-session';
import { GuestActions } from './GuestActions';
import { SessionNotice } from './SessionNotice';
import { SignedInActions } from './SignedInActions';

export function SessionChrome() {
  const { status, account, notice, logout } = useAccountSession();

  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:items-end">
      {notice ? <SessionNotice notice={notice} /> : null}
      {status === 'authenticated' && account ? (
        <SignedInActions name={account.name} onLogout={logout} />
      ) : null}
      {status === 'anonymous' || status === 'unreachable' ? <GuestActions /> : null}
    </div>
  );
}
