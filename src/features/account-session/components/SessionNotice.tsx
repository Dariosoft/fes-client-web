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
    <p
      className="w-full rounded-xl border border-destructive bg-card px-3 py-2 text-sm text-destructive"
      role="alert"
      aria-live="polite"
    >
      {NOTICE_COPY[notice]}
    </p>
  );
}
