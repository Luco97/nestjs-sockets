import { Module } from '@nestjs/common';
import { BasicGateway } from './events/basic.gateway';

@Module({
  providers: [BasicGateway],
})
export class SocketsModule {}
