import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from '../server/permissions.js';
import { TokenService } from './token.service.js';

export const PERMISSION_KEY = 'permission';

export type PermissionRequest = {
  params: Record<string, string>;
};

export type PermissionCheck = (
  user: AuthUser,
  request: PermissionRequest,
) => boolean;

export const RequirePermission = (check: PermissionCheck) =>
  SetMetadata(PERMISSION_KEY, check);

type GuardRequest = {
  headers: { authorization?: string };
  params?: Record<string, string | string[]>;
  user?: AuthUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GuardRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Faça login para continuar.');
    }

    try {
      request.user = await this.tokens.verify(header.slice('Bearer '.length));
    } catch {
      throw new UnauthorizedException('Faça login para continuar.');
    }

    return true;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const check = this.reflector.getAllAndOverride<PermissionCheck | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!check) {
      throw new ForbiddenException('Sem permissão.');
    }

    const request = context.switchToHttp().getRequest<GuardRequest>();
    const user = request.user;
    if (!user || !check(user, { params: normalizeParams(request.params) })) {
      throw new ForbiddenException('Sem permissão.');
    }

    return true;
  }
}

function normalizeParams(
  params: Record<string, string | string[]> | undefined,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params ?? {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? (value[0] ?? '') : value,
    ]),
  );
}
