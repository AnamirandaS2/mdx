const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type HealthReport =
  | { ok: true; database: string }
  | { ok: false };

type HealthResponse = {
  status?: string;
  info?: {
    database?: {
      status?: string;
    };
  };
};

export function getApiUrl() {
  return API_URL;
}

export async function getHealth(): Promise<HealthReport> {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false };
    }

    const body = (await response.json()) as HealthResponse;
    const database = body.info?.database?.status;

    if (body.status !== "ok" || !database) {
      return { ok: false };
    }

    return { ok: true, database };
  } catch {
    return { ok: false };
  }
}
