import { Module } from '@nestjs/common';
import { BillingConsumer } from './billing.consumer';

@Module({
  imports: [],
  providers: [BillingConsumer],
})
export class BillingModule {}
