export const ACCOUNT_PATHS = {
  session: '/accounts/session',
  logout: '/accounts/logout',
  googleLogin: '/accounts/login/google',
} as const;

export const ACCOUNT_PARAMS = {
  loginError: 'login_error',
  returnTo: 'return_to',
} as const;
