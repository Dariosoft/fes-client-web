import { AlertCircle } from 'lucide-react';
import type { SessionNotice as SessionNoticeKind } from '../hooks/use-account-session/use-account-session';

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
      className="rounded-xl border border-destructive bg-card px-2 py-2 text-sm text-destructive sm:px-3"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle aria-hidden="true" className="size-4 sm:hidden" />
      <span className="hidden sm:inline">{NOTICE_COPY[notice]}</span>
      <span className="sr-only sm:hidden">{NOTICE_COPY[notice]}</span>
    </p>
  );
}
