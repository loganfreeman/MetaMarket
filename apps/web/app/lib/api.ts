export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status?: number; message: string };

export async function fetchApi<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${apiUrl}${path}`, { cache: "no-store" });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: `API request failed with status ${response.status}`
      };
    }

    return { ok: true, data: (await response.json()) as T };
  } catch {
    return {
      ok: false,
      message: `API is not reachable at ${apiUrl}`
    };
  }
}
