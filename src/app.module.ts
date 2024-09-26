import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { QUEUE_KEYS } from './keys';
import { SessionsModule } from './modules/sessions/sessions.module';
import { CreditsModule } from './modules/credits/credits.module';

const isDevelopment = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isDevelopment ? '.env.development' : '.env.production',
    }),
    // configure redis instance
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          connection: {
            url: configService.get('REDIS_URL'),
          },
          defaultJobOptions: {
            attempts: 3,
          },
        };
      },
    }),
    // configure queues names
    BullModule.registerQueue(
      ...Object.values(QUEUE_KEYS).map((name) => ({ name })),
    ),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
      boardOptions: {
        uiConfig: {
          boardLogo: {
            path: 'https://app.getjogo.com/icon-app.png',
            width: 35,
            height: 35,
          },
          favIcon: {
            default: 'https://app.getjogo.com/favicon/favicon.ico',
            alternative: 'https://app.getjogo.com/favicon/favicon.ico',
          },
          boardTitle: 'Jogo - Queues',
        },
      },
    }),
    // set in board module the queues to be monitored
    ...Object.values(QUEUE_KEYS).map((name) =>
      BullBoardModule.forFeature({
        name: name,
        adapter: BullMQAdapter,
      }),
    ),
    // module to process sessions
    SessionsModule,
    CreditsModule,
  ],
})
export class AppModule {}
