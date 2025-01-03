import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { createNotificationApiClient } from '@jogolabs/notification-sdk';

import { QUEUE_KEYS } from '../../keys';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor(QUEUE_KEYS.notifications)
export class NotificationsConsumer extends WorkerHost {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async process(job: Job<any>) {
    const data = job.data;
    console.log('Processing SESSIONS job:', job.id);
    console.log('Job data:', data);

    const instance = createNotificationApiClient(
      this.configService.get('NOTIFICATION_SERVER_URL'),
      this.configService.get('NOTIFICATION_SERVICE_TOKEN'),
    );

    if (data.type === 'notification') {
      try {
        const response = await instance.notifications.send({
          requestBody: data.payload,
        });

        console.log('Job processed successfully', response);
        return response;
      } catch (error) {
        console.error('Error processing job:', error);
        throw new Error(error);
      }
    } else if (data.type === 'manyNotifications') {
      try {
        const response = await instance.notifications.sendMany({
          requestBody: data.payload,
        });

        console.log('Job processed successfully', response);
        return response;
      } catch (error) {
        console.error('Error processing job:', error);
        throw new Error(error);
      }
    } else if (data.type === 'email') {
      try {
        const response = await instance.emails.send({
          requestBody: data.payload,
        });

        console.log('Job processed successfully', response);
        return response;
      } catch (error) {
        console.error('Error processing job:', error);
        throw new Error(error);
      }
    }

    console.error('Invalid job type:', data);
    throw new Error('Invalid job type');
  }
}
