'use client';

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T & { error?: string };
}

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method: init.method ?? (init.body ? 'POST' : 'GET'),
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
      credentials: 'same-origin',
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'NETWORK' } as T & { error?: string } };
  }
}
