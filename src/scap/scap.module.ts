import { Module } from '@nestjs/common';
import { ScapService } from './scap.service';
import { ScapController } from './scap.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScapController],
  providers: [ScapService],
})
export class ScapModule {}
