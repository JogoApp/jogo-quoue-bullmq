import { Module } from '@nestjs/common';
import { SessionsConsumer } from './sessions.consumer';

@Module({
  imports: [],
  providers: [SessionsConsumer],
})
export class SessionsModule {}
