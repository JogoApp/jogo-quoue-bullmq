import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { GraphQLClient, gql } from 'graphql-request';

import { QUEUE_KEYS } from '../../keys';
import { ConfigService } from '@nestjs/config';

const NOTIFICATION_WHEN_CREDITS_END_MUTATION = gql`
  mutation NotifyWhenCreditEnds($data: NotifyWhenCreditEndsInput!) {
    notifyWhenCreditEnds(data: $data) {
      id
      status
      user {
        devices {
          id
          device_manufacturer
          device_model
          device_name
          token
          device_platform
          device_system_version
          state
        }
      }
    }
  }
`;

@Injectable()
@Processor(QUEUE_KEYS.credits)
export class CreditsConsumer extends WorkerHost {
  constructor(
    @InjectGraphQLClient() private readonly client: GraphQLClient,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    console.log('Processing CREDITS job:', job.id);
    console.log('Job data:', job.data);

    try {
      const { notifyWhenCreditEnds } = await this.client.request<{
        notifyWhenCreditEnds: any;
      }>(NOTIFICATION_WHEN_CREDITS_END_MUTATION, {
        data: {
          ...job.data,
          token: this.configService.get('API_TOKEN'),
        },
      });

      console.log('Job processed successfully');
      return notifyWhenCreditEnds;
    } catch (error) {
      console.error('Error processing job:', error);
      throw new Error(error);
    }
  }
}
