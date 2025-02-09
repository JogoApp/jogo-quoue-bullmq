import { Module } from '@nestjs/common';
import { BillingConsumer } from './billing.consumer';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // configure graphql-request
    GraphQLRequestModule.forRootAsync(GraphQLRequestModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          endpoint: `${configService.get('SERVER_URL')}/api/graphql`,
          options: {
            headers: {
              'content-type': 'application/json',
            },
          },
        };
      },
    }),
  ],
  providers: [BillingConsumer],
})
export class BillingModule {}
