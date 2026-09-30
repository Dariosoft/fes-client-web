export type AccountSessionResponse =
  | { authenticated: false }
  | { authenticated: true; id: string; email: string; name: string };
