import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { GraphQLClient, gql } from 'graphql-request';

import { QUEUE_KEYS } from '../../keys';
import { ConfigService } from '@nestjs/config';
import { DataJobType } from './type';

const CHANGE_STATE_SPACE_MUTATION = gql`
  mutation ChangeStatusSpaceQueue2(
    $spaceId: ID!
    $data: SpaceUpdateInput!
    $token: String!
  ) {
    updateSpaceByService(where: { id: $spaceId }, data: $data, token: $token) {
      id
    }
  }
`;

@Injectable()
@Processor(QUEUE_KEYS.billings)
export class BillingConsumer extends WorkerHost {
  private client: GraphQLClient;

  constructor(private readonly configService: ConfigService) {
    super();
    this.client = new GraphQLClient(
      `${configService.get('SERVER_URL')}/api/graphql`,
    );
  }

  async process(job: Job<DataJobType>) {
    console.log('Processing BILLING job:', job.id);
    console.log('Job data:', job.data);

    try {
      const { updateSpaceByService } = await this.client.request<{
        updateSpaceByService: any;
      }>(CHANGE_STATE_SPACE_MUTATION, {
        spaceId: job.data.spaceId,
        data: {
          status: job?.data?.newStatus,
        },
        token: this.configService.get('API_TOKEN'),
      });

      console.log('Job processed successfully');
      return updateSpaceByService;
    } catch (error) {
      console.error('Error processing job:', error);
      console.log(JSON.stringify(error));
      throw new Error(error);
    }
  }
}
