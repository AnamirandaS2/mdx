import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.schema.js';
import { EventsModule } from './events/events.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        const ssl = url.includes('sslmode=require');

        return {
          type: 'postgres' as const,
          url,
          autoLoadEntities: true,
          synchronize: false,
          ssl: ssl ? { rejectUnauthorized: false } : undefined,
        };
      },
    }),
    HealthModule,
    AuthModule,
    EventsModule,
  ],
})
export class AppModule {}
