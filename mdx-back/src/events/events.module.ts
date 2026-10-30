import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import {
  AdminEventsController,
  PublicEventsController,
  UploadsController,
} from './events.controller.js';
import { EventsRepository } from './events.repository.js';
import { EventsService } from './events.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminEventsController, PublicEventsController, UploadsController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
