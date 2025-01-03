import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { QUEUE_KEYS } from './keys';
import { SessionsModule } from './modules/sessions/sessions.module';
import { CreditsModule } from './modules/credits/credits.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { JwtAuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/auth.guard';

const isDevelopment = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
    }),
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
      route: '/admin/queues',
      adapter: ExpressAdapter,
      boardOptions: {
        uiConfig: {
          locale: {
            lng: 'es',
          },
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
    JwtAuthModule,
    NotificationsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtAuthGuard).forRoutes('/admin/queues');
  }
}
