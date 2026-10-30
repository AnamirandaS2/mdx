import {
  findScheduleConflicts,
  fortalezaDay,
  planSteamStands,
  publishBlockers,
  slugify,
  steamStands,
} from './event-schema.js';
import * as web from '../../../mdx-front/src/server/event-schema.ts';

describe('regras do evento', () => {
  it('gera slug a partir do título, igual na API e no front', () => {
    expect(slugify('MDX 2026')).toBe('mdx-2026');
    expect(web.slugify('MDX 2026')).toBe('mdx-2026');
    expect(slugify('Olá, Mermãs!')).toBe('ola-mermas');
    expect(web.slugify('Olá, Mermãs!')).toBe('ola-mermas');
  });

  it('recusa slug inválido e data invertida nos dois lados', () => {
    expect(web.slugSchema.safeParse('MDX 2026').success).toBe(false);
    expect(web.slugSchema.safeParse('mdx-2026').success).toBe(true);
    expect(publishBlockers({
      title: 'MDX 2026',
      startsAt: '2026-11-25T21:00:00.000Z',
      endsAt: '2026-11-24T11:00:00.000Z',
      place: 'IFMA Imperatriz',
      activityCount: 1,
    })).toContain('O fim precisa ser depois do início.');
    expect(web.publishBlockers({
      title: 'MDX 2026',
      startsAt: '2026-11-25T21:00:00.000Z',
      endsAt: '2026-11-24T11:00:00.000Z',
      place: 'IFMA Imperatriz',
      activityCount: 1,
    })).toContain('O fim precisa ser depois do início.');
  });

  it('agrupa a programação no fuso America/Fortaleza', () => {
    expect(fortalezaDay('2026-11-24T02:30:00.000Z')).toBe('2026-11-23');
    expect(web.fortalezaDay('2026-11-24T02:30:00.000Z')).toBe('2026-11-23');
    expect(fortalezaDay('2026-11-24T11:00:00.000Z')).toBe('2026-11-24');
    expect(web.fortalezaDay('2026-11-24T11:00:00.000Z')).toBe('2026-11-24');
  });

  it('só libera publicação com título, datas, local e atividade', () => {
    const draft = {
      title: 'MDX 2026',
      startsAt: null,
      endsAt: null,
      place: '',
      activityCount: 0,
    };
    expect(publishBlockers(draft)).toEqual([
      'Informe o início e o fim.',
      'Informe o local.',
      'Cadastre pelo menos uma atividade.',
    ]);
    expect(web.publishBlockers(draft)).toEqual(publishBlockers(draft));
    expect(publishBlockers({
      title: 'MDX 2026',
      startsAt: '2026-11-24T11:00:00.000Z',
      endsAt: '2026-11-25T21:00:00.000Z',
      place: 'IFMA Imperatriz',
      activityCount: 1,
    })).toEqual([]);
  });

  it('limita banner a jpeg, png ou webp de até 2 MB', () => {
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]);
    expect(web.bannerError({ mimetype: 'image/png', size: png.length, bytes: png })).toBeNull();
    expect(web.bannerError({ mimetype: 'image/jpeg', size: png.length, bytes: png })).toBe(
      'O arquivo não é a imagem que ele declara.',
    );
    expect(web.bannerError({ mimetype: 'image/gif', size: 10 })).toBe(
      'Use uma imagem JPEG, PNG ou WebP.',
    );
    expect(web.bannerError({ mimetype: 'image/png', size: web.BANNER_MAX_BYTES + 1 })).toBe(
      'A imagem pode ter no máximo 2 MB.',
    );
  });

  it('aponta conflito só quando o mesmo local se sobrepõe', () => {
    const patio = '11111111-1111-4111-8111-111111111111';
    const lab = '22222222-2222-4222-8222-222222222222';
    const items = [
      item('a', 'Ciência', patio, '2026-11-24T12:00:00.000Z', '2026-11-24T15:00:00.000Z'),
      item('b', 'Tecnologia', lab, '2026-11-24T12:00:00.000Z', '2026-11-24T15:00:00.000Z'),
      item('c', 'Abertura', patio, '2026-11-24T11:00:00.000Z', '2026-11-24T12:00:00.000Z'),
    ];
    expect(findScheduleConflicts(items)).toEqual([]);
    expect(web.findScheduleConflicts(items)).toEqual([]);
    const clash = findScheduleConflicts([
      ...items,
      item('d', 'Choque', patio, '2026-11-24T14:00:00.000Z', '2026-11-24T16:00:00.000Z'),
    ]);
    expect(clash).toEqual([{
      locationId: patio,
      activityIds: ['a', 'd'],
      titles: ['Ciência', 'Choque'],
    }]);
    expect(web.findScheduleConflicts([
      item('e', 'Sem sala', null, '2026-11-24T12:00:00.000Z', '2026-11-24T15:00:00.000Z'),
      item('f', 'Também sem sala', null, '2026-11-24T12:00:00.000Z', '2026-11-24T15:00:00.000Z'),
    ])).toEqual([]);
  });

  it('encaixa os 5 stands STEAM sem sobrepor local', () => {
    const patio = '11111111-1111-4111-8111-111111111111';
    const lab = '22222222-2222-4222-8222-222222222222';
    const planned = planSteamStands({
      startsAt: '2026-11-24T11:00:00.000Z',
      endsAt: '2026-11-25T21:00:00.000Z',
      locationIds: [patio, lab],
      existing: [],
    });
    expect(planned.map((stand) => stand.title)).toEqual(steamStands.map((stand) => stand.title));
    expect(planned[0]?.startsAt).toBe(planned[1]?.startsAt);
    expect(planned[0]?.locationId).not.toBe(planned[1]?.locationId);
    expect(web.findScheduleConflicts(planned.map((stand, index) => ({
      id: String(index),
      title: stand.title,
      locationId: stand.locationId,
      startsAt: stand.startsAt,
      endsAt: stand.endsAt,
    })))).toEqual([]);
    const again = web.planSteamStands({
      startsAt: '2026-11-24T11:00:00.000Z',
      endsAt: '2026-11-25T21:00:00.000Z',
      locationIds: [patio],
      existing: planned.map((stand, index) => ({
        id: String(index),
        title: stand.title,
        locationId: patio,
        startsAt: stand.startsAt,
        endsAt: stand.endsAt,
      })),
    });
    expect(again).toEqual([]);
  });
});

function item(
  id: string,
  title: string,
  locationId: string | null,
  startsAt: string,
  endsAt: string,
) {
  return { id, title, locationId, startsAt, endsAt };
}
