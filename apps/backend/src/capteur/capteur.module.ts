import { Module } from '@nestjs/common';
import { CapteurService } from './capteur.service';
import { CapteurController } from './capteur.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CapteurController],
  providers: [CapteurService],
})
export class CapteurModule {}
