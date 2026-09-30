import { useAccountSession } from '../hooks/use-account-session/use-account-session';
import { SESSION_STATUS } from '../constants';
import { GuestActions } from './GuestActions';
import { SessionNotice } from './SessionNotice';
import { SignedInActions } from './SignedInActions';

export function AccountSession() {
  const { status, account, notice, logout } = useAccountSession();

  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:items-end">
      {notice ? <SessionNotice notice={notice} /> : null}
      {status === SESSION_STATUS.authenticated && account ? (
        <SignedInActions name={account.name} onLogout={logout} />
      ) : null}
      {status === SESSION_STATUS.anonymous || status === SESSION_STATUS.unreachable ? (
        <GuestActions />
      ) : null}
    </div>
  );
}
