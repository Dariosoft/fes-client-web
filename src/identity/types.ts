/**
 * Minimal identity session types consumed from the accounts service.
 * These types do not model account creation or local persistence.
 */

export type AnonymousSession = {
  readonly status: 'anonymous';
};

export type IdentifiedSession = {
  readonly status: 'identified';
  readonly displayName: string;
  readonly email: string;
};

export type IdentitySession = AnonymousSession | IdentifiedSession;

export function isIdentifiedSession(
  session: IdentitySession,
): session is IdentifiedSession {
  return session.status === 'identified';
}
