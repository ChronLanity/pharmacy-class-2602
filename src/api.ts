// API helper for backend calls
export async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const userId = localStorage.getItem('user_id');
  const userName = localStorage.getItem('user_name');
  
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'content-type': 'application/json',
      'x-user-id': userId || '',
      'x-user-name': userName || '',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let error = '请求失败';
    try {
      const json = JSON.parse(text);
      error = json.error || error;
    } catch {}
    throw new Error(error);
  }

  return res.json();
}
