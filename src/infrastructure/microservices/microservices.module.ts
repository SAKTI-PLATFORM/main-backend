import { Global, Module } from '@nestjs/common';
import { MicroservicesClient } from './microservices.client';

@Global()
@Module({
  providers: [MicroservicesClient],
  exports: [MicroservicesClient],
})
export class MicroservicesModule {}
