import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { PieceModule } from './piece/piece.module';
import { LotModule } from './lot/lot.module';
import { CapteurModule } from './capteur/capteur.module';
import { ScapModule } from './scap/scap.module';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [
    PrismaModule,
    PieceModule,
    LotModule,
    CapteurModule,
    ScapModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
