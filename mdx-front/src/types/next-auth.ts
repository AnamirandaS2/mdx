import type { DefaultSession } from "next-auth";
import type { EventRole, GlobalRole } from "@/server/permissions";

export type SessionMembership = {
  eventId: string;
  role: EventRole;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: GlobalRole;
      memberships: SessionMembership[];
    } & DefaultSession["user"];
  }

  interface User {
    role: GlobalRole;
    memberships: SessionMembership[];
    apiToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: GlobalRole;
    memberships?: SessionMembership[];
    apiToken?: string;
  }
}
