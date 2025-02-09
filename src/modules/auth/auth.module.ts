import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { JwtAuthStrategy } from './auth.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  providers: [JwtAuthStrategy, JwtAuthGuard],
  exports: [JwtAuthStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class JwtAuthModule {}
