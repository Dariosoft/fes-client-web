import type { SessionNotice as SessionNoticeKind } from '../hooks/use-account-session';

const NOTICE_COPY: Record<SessionNoticeKind, string> = {
  'session-unreachable': 'No se pudo comprobar la sesión.',
  'login-failed': 'No se pudo entrar.',
};

type SessionNoticeProps = {
  notice: SessionNoticeKind;
};

export function SessionNotice({ notice }: SessionNoticeProps) {
  return (
    <p className="session-notice" role="alert" aria-live="polite">
      {NOTICE_COPY[notice]}
    </p>
  );
}
