const DEFAULT_API_BASE_URL = 'https://api.friendly-e-shop.duckdns.org';

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}
