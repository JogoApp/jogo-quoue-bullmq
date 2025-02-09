import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { GraphQLClient, gql } from 'graphql-request';

import { QUEUE_KEYS } from '../../keys';
import { ConfigService } from '@nestjs/config';

const CHANGE_STATE_SESSION_MUTATION = gql`
  mutation ChangeStatusSessionQueue($data: ChangeStatusSessionQueueInput!) {
    changeStatusSessionQueue(data: $data) {
      id
      name
      status
    }
  }
`;

@Injectable()
@Processor(QUEUE_KEYS.sessions)
export class SessionsConsumer extends WorkerHost {
  constructor(
    @InjectGraphQLClient() private readonly client: GraphQLClient,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    console.log('Processing SESSIONS job:', job.id);
    console.log('Job data:', job.data);

    try {
      const { changeStatusSessionQueue } = await this.client.request<{
        changeStatusSessionQueue: any;
      }>(CHANGE_STATE_SESSION_MUTATION, {
        data: {
          ...job.data,
          token: this.configService.get('API_TOKEN'),
        },
      });

      console.log('Job processed successfully');
      return changeStatusSessionQueue;
    } catch (error) {
      console.error('Error processing job:', error);
      throw new Error(error);
    }
  }
}
