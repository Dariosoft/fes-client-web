export type AccountSessionResponse =
  | { authenticated: false }
  | { authenticated: true; id: string; email: string; name: string };

export type PublicShop = {
  name: string;
  description: string | null;
};
