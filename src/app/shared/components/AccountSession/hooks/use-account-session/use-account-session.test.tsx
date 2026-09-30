import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSession } from '../../../../api/account/get-session/get-session';
import { postLogout } from '../../../../api/account/post-logout/post-logout';
import { consumeLoginErrorFromUrl } from '../../lib/login-error-from-url/login-error-from-url';
import { useAccountSession } from './use-account-session';

vi.mock('../../../../api/account/get-session/get-session');
vi.mock('../../../../api/account/post-logout/post-logout');
vi.mock('../../lib/login-error-from-url/login-error-from-url');

const getSessionMock = vi.mocked(getSession);
const postLogoutMock = vi.mocked(postLogout);
const consumeLoginErrorFromUrlMock = vi.mocked(consumeLoginErrorFromUrl);

describe('useAccountSession', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    consumeLoginErrorFromUrlMock.mockReturnValue(false);
  });

  it('hydrates an authenticated account', async () => {
    getSessionMock.mockResolvedValue({
      authenticated: true,
      id: 'acc-1',
      email: 'ana@example.com',
      name: 'Ana',
    });

    const { result } = renderHook(() => useAccountSession());

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.account?.name).toBe('Ana');
    expect(result.current.notice).toBeNull();
  });

  it('hydrates an anonymous session with the consumed login error', async () => {
    consumeLoginErrorFromUrlMock.mockReturnValue(true);
    getSessionMock.mockResolvedValue({ authenticated: false });

    const { result } = renderHook(() => useAccountSession());

    await waitFor(() => expect(result.current.status).toBe('anonymous'));
    expect(result.current.account).toBeNull();
    expect(result.current.notice).toBe('login-failed');
  });

  it('reports an unreachable session service', async () => {
    getSessionMock.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useAccountSession());

    await waitFor(() => expect(result.current.status).toBe('unreachable'));
    expect(result.current.notice).toBe('session-unreachable');
  });

  it('clears the authenticated account after logout', async () => {
    getSessionMock.mockResolvedValue({
      authenticated: true,
      id: 'acc-1',
      email: 'ana@example.com',
      name: 'Ana',
    });
    postLogoutMock.mockResolvedValue();
    const { result } = renderHook(() => useAccountSession());
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await act(() => result.current.logout());

    expect(postLogoutMock).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('anonymous');
    expect(result.current.account).toBeNull();
  });

  it('preserves authenticated state when logout fails', async () => {
    getSessionMock.mockResolvedValue({
      authenticated: true,
      id: 'acc-1',
      email: 'ana@example.com',
      name: 'Ana',
    });
    postLogoutMock.mockRejectedValue(new Error('logout failed'));
    const { result } = renderHook(() => useAccountSession());
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await expect(result.current.logout()).rejects.toThrow('logout failed');

    expect(result.current.status).toBe('authenticated');
    expect(result.current.account?.name).toBe('Ana');
  });
});
