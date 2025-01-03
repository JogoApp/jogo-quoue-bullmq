import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsConsumer } from './notifications.consumer';

@Module({
  imports: [ConfigModule, ConfigService],
  providers: [NotificationsConsumer],
})
export class NotificationsModule {}
