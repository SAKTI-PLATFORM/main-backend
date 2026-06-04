import { Global, Module } from '@nestjs/common';
import { SaktiAiClient } from './sakti-ai.client';

@Global()
@Module({
  providers: [SaktiAiClient],
  exports: [SaktiAiClient],
})
export class SaktiAiModule {}
