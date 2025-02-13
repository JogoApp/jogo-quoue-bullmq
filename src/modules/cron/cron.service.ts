import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { gql, GraphQLClient } from 'graphql-request';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import dayjs from 'dayjs';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_KEYS } from '../../keys';
import { DataJobType, StatusSpaceEnum } from '../billing/type';

const GET_SPACES_QUERY = gql`
  query GetSpace($token: String!) {
    spacesByService(where: { status: { equals: "TRIAL" } }, token: $token) {
      id
      trialEndAt
      status
    }
  }
`;

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectGraphQLClient() private readonly client: GraphQLClient,
    @InjectQueue(QUEUE_KEYS.billings) private billingQueue: Queue<DataJobType>,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    this.logger.log('Cron job ejecutado cada 1 dia');
    try {
      const { spacesByService } = await this.client.request<{
        spacesByService: any;
      }>(GET_SPACES_QUERY, {
        token: this.configService.get('API_TOKEN'),
      });

      for (const space of spacesByService) {
        this.logger.log(
          `Space ${space.id} is in status ${space.status}, trial ends at ${space.trialEndAt}`,
        );
        const trialEndAt = dayjs(space.trialEndAt)
          .add(48, 'hours')
          .diff(dayjs(), 'millisecond');

        if (trialEndAt < 0) {
          this.logger.log(
            `Space ${space.id} is in status ${space.status}, trial has ended`,
          );
          await this.billingQueue.add(space.id, {
            newStatus: StatusSpaceEnum.PAST_DUE,
            spaceId: space.id,
          });
          this.logger.log(`Space ${space.id} has been queue for Past Due`);
        }
      }
    } catch (error) {
      console.error('Error processing job:', error);
      throw new Error(error);
    }
  }
}
