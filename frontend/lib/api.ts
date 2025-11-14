
const BASE = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();

type ApiOpts = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

export async function api<T = any>(path: string, opts: ApiOpts = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  console.log("[API] →", url, opts.method ?? "GET");

  try {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.log("[API] respuesta no JSON:", text);
      throw new Error("Respuesta no válida del servidor");
    }

    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    return data as T;
  } catch (e: any) {
    console.log("[API] error:", e?.message);
    throw new Error("No se pudo conectar con el servidor");
  }
}
