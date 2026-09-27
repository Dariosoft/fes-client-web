import { useAccountSession } from '../hooks/use-account-session';
import { GuestActions } from './GuestActions';
import { SessionNotice } from './SessionNotice';
import { SignedInActions } from './SignedInActions';
import '../account-session.css';

export function SessionChrome() {
  const { status, account, notice, logout } = useAccountSession();

  return (
    <div className="session-chrome">
      {notice ? <SessionNotice notice={notice} /> : null}
      {status === 'authenticated' && account ? (
        <SignedInActions name={account.name} onLogout={logout} />
      ) : null}
      {status === 'anonymous' || status === 'unreachable' ? <GuestActions /> : null}
    </div>
  );
}
