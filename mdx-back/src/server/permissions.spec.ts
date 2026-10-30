import {
  canAccessAdmin,
  canCreateEvent,
  canCheckIn,
  canEditOwnRegistration,
  canManageEvent,
  canScore,
  canStamp,
  decideRouteAccess,
  type AuthUser,
  type EventRole,
  type GlobalRole,
} from './permissions.js';
import * as web from '../../../mdx-front/src/server/permissions.ts';

const eventId = 'event-1';
const otherEventId = 'event-2';

function person(
  role: GlobalRole,
  memberships: { eventId: string; role: EventRole }[] = [],
  id = 'user-1',
): AuthUser {
  return { id, role, memberships };
}

const roles = {
  admin: person('ADMIN'),
  organizer: person('USER', [{ eventId, role: 'ORGANIZER' }]),
  staff: person('USER', [{ eventId, role: 'STAFF' }]),
  monitor: person('USER', [{ eventId, role: 'MONITOR' }]),
  judge: person('USER', [{ eventId, role: 'JUDGE' }]),
  user: person('USER'),
};

function expectSame(
  name: string,
  run: (api: typeof web) => void,
) {
  it(`${name} na API e no front`, () => {
    run({
      canAccessAdmin,
      canCreateEvent,
      canCheckIn,
      canEditOwnRegistration,
      canManageEvent,
      canScore,
      canStamp,
      decideRouteAccess,
    } as typeof web);
    run(web);
  });
}

describe('permissões por papel', () => {
  expectSame('ADMIN pode tudo', (permissions) => {
    expect(permissions.canManageEvent(roles.admin, eventId)).toBe(true);
    expect(permissions.canStamp(roles.admin, eventId)).toBe(true);
    expect(permissions.canCheckIn(roles.admin, eventId)).toBe(true);
    expect(permissions.canScore(roles.admin, eventId)).toBe(true);
    expect(permissions.canAccessAdmin(roles.admin)).toBe(true);
    expect(permissions.canCreateEvent(roles.admin)).toBe(true);
    expect(permissions.canEditOwnRegistration(roles.admin, 'outra-pessoa')).toBe(
      true,
    );
  });

  expectSame('ORGANIZER edita só o próprio evento', (permissions) => {
    expect(permissions.canManageEvent(roles.organizer, eventId)).toBe(true);
    expect(permissions.canManageEvent(roles.organizer, otherEventId)).toBe(
      false,
    );
    expect(permissions.canStamp(roles.organizer, eventId)).toBe(false);
    expect(permissions.canCheckIn(roles.organizer, eventId)).toBe(false);
    expect(permissions.canScore(roles.organizer, eventId)).toBe(false);
    expect(permissions.canAccessAdmin(roles.organizer)).toBe(true);
    expect(permissions.canCreateEvent(roles.organizer)).toBe(false);
  });

  expectSame('STAFF só credencia e carimba', (permissions) => {
    expect(permissions.canCheckIn(roles.staff, eventId)).toBe(true);
    expect(permissions.canStamp(roles.staff, eventId)).toBe(true);
    expect(permissions.canCheckIn(roles.staff, otherEventId)).toBe(false);
    expect(permissions.canManageEvent(roles.staff, eventId)).toBe(false);
    expect(permissions.canScore(roles.staff, eventId)).toBe(false);
    expect(permissions.canAccessAdmin(roles.staff)).toBe(true);
  });

  expectSame('MONITOR só credencia e carimba', (permissions) => {
    expect(permissions.canCheckIn(roles.monitor, eventId)).toBe(true);
    expect(permissions.canStamp(roles.monitor, eventId)).toBe(true);
    expect(permissions.canManageEvent(roles.monitor, eventId)).toBe(false);
    expect(permissions.canScore(roles.monitor, eventId)).toBe(false);
    expect(permissions.canAccessAdmin(roles.monitor)).toBe(true);
  });

  expectSame('JUDGE só lança pontuação', (permissions) => {
    expect(permissions.canScore(roles.judge, eventId)).toBe(true);
    expect(permissions.canScore(roles.judge, otherEventId)).toBe(false);
    expect(permissions.canStamp(roles.judge, eventId)).toBe(false);
    expect(permissions.canCheckIn(roles.judge, eventId)).toBe(false);
    expect(permissions.canManageEvent(roles.judge, eventId)).toBe(false);
    expect(permissions.canAccessAdmin(roles.judge)).toBe(true);
  });

  expectSame('USER comum só mexe na própria inscrição', (permissions) => {
    expect(permissions.canAccessAdmin(roles.user)).toBe(false);
    expect(permissions.canCreateEvent(roles.user)).toBe(false);
    expect(permissions.canCreateEvent(null)).toBe(false);
    expect(permissions.canManageEvent(roles.user, eventId)).toBe(false);
    expect(permissions.canStamp(roles.user, eventId)).toBe(false);
    expect(permissions.canCheckIn(roles.user, eventId)).toBe(false);
    expect(permissions.canScore(roles.user, eventId)).toBe(false);
    expect(permissions.canEditOwnRegistration(roles.user, roles.user.id)).toBe(
      true,
    );
    expect(permissions.canEditOwnRegistration(roles.user, 'outra-pessoa')).toBe(
      false,
    );
    expect(permissions.decideRouteAccess(roles.user, '/admin')).toEqual({
      type: 'forbid',
    });
    expect(permissions.decideRouteAccess(roles.user, '/admin/eventos')).toEqual({
      type: 'forbid',
    });
    expect(permissions.decideRouteAccess(roles.user, '/conta')).toEqual({
      type: 'allow',
    });
    expect(permissions.decideRouteAccess(null, '/admin')).toEqual({
      type: 'login',
    });
    expect(permissions.decideRouteAccess(roles.organizer, '/admin')).toEqual({
      type: 'allow',
    });
    expect(permissions.decideRouteAccess(roles.staff, '/admin')).toEqual({
      type: 'allow',
    });
    expect(permissions.decideRouteAccess(roles.monitor, '/conta/inscricoes')).toEqual(
      { type: 'allow' },
    );
    expect(permissions.decideRouteAccess(roles.judge, '/admin')).toEqual({
      type: 'allow',
    });
    expect(permissions.decideRouteAccess(roles.admin, '/admin')).toEqual({
      type: 'allow',
    });
  });
});
