import { Module } from '@nestjs/common';
import { PieceService } from './piece.service';
import { PieceController } from './piece.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PieceController],
  providers: [PieceService],
})
export class PieceModule {}
