import { Module } from '@nestjs/common';
import { AdminController, ContaController } from './access.controller.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard, PermissionGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginRateLimiter } from './login-rate-limiter.js';
import { TokenService } from './token.service.js';
import { UsersRepository } from './users.repository.js';

@Module({
  controllers: [AuthController, AdminController, ContaController],
  providers: [
    AuthService,
    AuthGuard,
    PermissionGuard,
    TokenService,
    LoginRateLimiter,
    UsersRepository,
  ],
  exports: [TokenService, AuthGuard, PermissionGuard],
})
export class AuthModule {}
