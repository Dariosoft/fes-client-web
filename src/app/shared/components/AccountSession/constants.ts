export const SESSION_STATUS = {
  loading: 'loading',
  anonymous: 'anonymous',
  authenticated: 'authenticated',
  unreachable: 'unreachable',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const SESSION_NOTICE = {
  sessionUnreachable: 'session-unreachable',
  loginFailed: 'login-failed',
} as const;

export type SessionNotice = (typeof SESSION_NOTICE)[keyof typeof SESSION_NOTICE];
