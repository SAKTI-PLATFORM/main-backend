import { Module } from '@nestjs/common';
import { SaktiAiClient } from './sakti-ai.client';

@Module({
  providers: [SaktiAiClient],
  exports: [SaktiAiClient],
})
export class SaktiAiModule {}
