import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { JwtAuthStrategy } from './auth.strategy';
import { AuthController } from './auth.controller';
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
  providers: [JwtAuthStrategy, JwtAuthGuard],
  exports: [JwtAuthStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class JwtAuthModule {}
