import { Controller, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import {
  canCheckIn,
  canEditOwnRegistration,
  canScore,
  canStamp,
} from '../server/permissions.js';
import { AuthGuard, PermissionGuard, RequirePermission } from './auth.guard.js';

@Controller('admin')
@UseGuards(AuthGuard, PermissionGuard)
export class AdminController {
  @Post('events/:eventId/check-in')
  @HttpCode(200)
  @RequirePermission((user, request) =>
    canCheckIn(user, request.params.eventId ?? ''),
  )
  checkIn() {
    return { ok: true };
  }

  @Post('events/:eventId/stamps')
  @HttpCode(200)
  @RequirePermission((user, request) =>
    canStamp(user, request.params.eventId ?? ''),
  )
  stamp() {
    return { ok: true };
  }

  @Post('events/:eventId/scores')
  @HttpCode(200)
  @RequirePermission((user, request) =>
    canScore(user, request.params.eventId ?? ''),
  )
  score() {
    return { ok: true };
  }
}

@Controller('conta')
@UseGuards(AuthGuard, PermissionGuard)
export class ContaController {
  @Patch('registrations/:ownerId')
  @RequirePermission((user, request) =>
    canEditOwnRegistration(user, request.params.ownerId ?? ''),
  )
  updateRegistration() {
    return { ok: true };
  }
}
