'use client';

// Simple fetch wrapper used by legacy components
export async function apiCall(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || 'Request failed');
  }
  return data;
}
