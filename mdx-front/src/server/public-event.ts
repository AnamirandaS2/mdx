import { cache } from "react";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { getApiUrl, getPublicEvent, type PublicEvent } from "@/lib/api";

export const loadEventPage = cache(async (slug: string): Promise<PublicEvent | null | undefined> => {
  const published = await getPublicEvent(slug);
  if (published) return published;
  if (published === undefined) return undefined;

  const token = await apiToken();
  if (!token) return null;
  try {
    const response = await fetch(
      `${getApiUrl()}/api/events/${encodeURIComponent(slug)}/preview`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (response.status === 401 || response.status === 403 || response.status === 404) return null;
    if (!response.ok) return undefined;
    return (await response.json()) as PublicEvent;
  } catch {
    return undefined;
  }
});

async function apiToken(): Promise<string | null> {
  const cookie = (await cookies()).toString();
  const token = await getToken({
    req: { headers: { cookie } },
    secret: process.env.AUTH_SECRET,
  });
  return typeof token?.apiToken === "string" ? token.apiToken : null;
}
