export const globalRoles = ["ADMIN", "USER"] as const;
export type GlobalRole = (typeof globalRoles)[number];

export const eventRoles = ["ORGANIZER", "STAFF", "MONITOR", "JUDGE"] as const;
export type EventRole = (typeof eventRoles)[number];

export type Membership = {
  eventId: string;
  role: EventRole;
};

export type AuthUser = {
  id: string;
  role: GlobalRole;
  memberships: Membership[];
};

export type RouteDecision =
  | { type: "allow" }
  | { type: "login" }
  | { type: "forbid" };

function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}

function eventRole(user: AuthUser, eventId: string): EventRole | undefined {
  return user.memberships.find((membership) => membership.eventId === eventId)
    ?.role;
}

export function canManageEvent(
  user: AuthUser | null,
  eventId: string,
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return eventRole(user, eventId) === "ORGANIZER";
}

export function canStamp(user: AuthUser | null, eventId: string): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const role = eventRole(user, eventId);
  return role === "STAFF" || role === "MONITOR";
}

export function canCheckIn(user: AuthUser | null, eventId: string): boolean {
  return canStamp(user, eventId);
}

export function canScore(user: AuthUser | null, eventId: string): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return eventRole(user, eventId) === "JUDGE";
}

export function canAccessAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.memberships.length > 0;
}

export function canCreateEvent(user: AuthUser | null): boolean {
  if (!user) return false;
  return isAdmin(user);
}

export function canEditOwnRegistration(
  user: AuthUser | null,
  ownerId: string,
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.id === ownerId;
}

export function decideRouteAccess(
  user: AuthUser | null,
  pathname: string,
): RouteDecision {
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const conta = pathname === "/conta" || pathname.startsWith("/conta/");
  if (!admin && !conta) return { type: "allow" };
  if (!user) return { type: "login" };
  if (admin && !canAccessAdmin(user)) return { type: "forbid" };
  return { type: "allow" };
}
