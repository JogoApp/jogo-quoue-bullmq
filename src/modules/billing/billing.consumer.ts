import { Job } from 'bullmq';
import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { gql, GraphQLClient } from 'graphql-request';

import { QUEUE_KEYS } from '../../keys';
import { ConfigService } from '@nestjs/config';
import { DataJobType, StatusSpaceEnum } from './type';

const GET_SPACE_QUERY = gql`
  query GetSpaceQueue($spaceId: ID!, $token: String!) {
    spaceIdByService(where: { id: $spaceId }, token: $token) {
      id
      status
      trialEndAt
    }
  }
`;

const CHANGE_STATE_SPACE_MUTATION = gql`
  mutation ChangeStatusSpaceQueue(
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
  constructor(
    @InjectGraphQLClient() private readonly client: GraphQLClient,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<DataJobType>) {
    console.log('Processing BILLING job:', job.id);
    console.log('Job data:', job.data);
    const { verifyTrialStatus = false, spaceId, ...restData } = job.data;

    let newStatus = restData?.newStatus;
    try {
      if (
        verifyTrialStatus &&
        [
          StatusSpaceEnum.ACTIVE,
          StatusSpaceEnum.SUSPENDED,
          StatusSpaceEnum.PAST_DUE,
        ].includes(newStatus)
      ) {
        const { spaceIdByService } = await this.client.request<{
          spaceIdByService: { status: string; id: string; trialEndAt: string };
        }>(GET_SPACE_QUERY, {
          spaceId,
          token: this.configService.get('API_TOKEN'),
        });

        const trialEndAt = spaceIdByService?.trialEndAt;

        if (trialEndAt && dayjs(trialEndAt).isAfter(dayjs())) {
          newStatus = StatusSpaceEnum.TRIAL;
        }
      }

      const { updateSpaceByService } = await this.client.request<{
        updateSpaceByService: any;
      }>(CHANGE_STATE_SPACE_MUTATION, {
        spaceId: spaceId,
        data: {
          status: newStatus,
        },
        token: this.configService.get('API_TOKEN'),
      });

      console.log('Job processed successfully');
      return updateSpaceByService;
    } catch (error) {
      console.log(JSON.stringify(error?.response));
      console.error('Error processing job:', error);
      throw new Error(error);
    }
  }
}
