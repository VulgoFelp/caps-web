import { useClient } from "@revolt/client";

export type StaffRole = "admin" | "mod";

export type StaffUser = {
  id: string;
  username: string;
  discriminator: string;
  displayName: string | null;
  avatar: string | null;
  badges: number;
  flags: number;
  privileged: boolean;
  bot: boolean;
  role: StaffRole | null;
  banned: boolean;
  createdAt: string;
};

/**
 * Client for the CAPS staff API (`/staff-api`, service `caps-admin`)
 */
export function useStaffApi() {
  const client = useClient();

  async function call<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const [header, token] = client().authenticationHeader;
    const res = await fetch(`/staff-api${path}`, {
      method,
      headers: {
        [header]: token,
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
    return data as T;
  }

  /**
   * Media URL for an uploaded file id (avatars, icons)
   */
  function media(tag: "avatars" | "icons", id: string | null) {
    const autumn = client().configuration?.features.autumn;
    return id && autumn?.enabled ? `${autumn.url}/${tag}/${id}` : undefined;
  }

  return {
    get: <T>(path: string) => call<T>("GET", path),
    post: <T>(path: string, body?: unknown) =>
      call<T>("POST", path, body ?? {}),
    del: <T>(path: string, body?: unknown) =>
      call<T>("DELETE", path, body ?? {}),
    media,
  };
}

export const tagOf = (u: { username: string; discriminator: string }) =>
  `${u.username}#${u.discriminator}`;

export function formatDate(iso: string | Date, withTime = false) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}
