import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JsonNull } from '@prisma/client/runtime/client';

@Injectable()
export class ScapService {
  constructor(private prisma: PrismaService) {}

  async findAllBatId(batId: string) {
    const idbatCherche = await this.prisma.batiment.findFirst({ where : { idsmplr : batId }, select : { idbat: true}});

    return this.prisma.piece.groupBy({
      by: ["codescap"],
      where: {idbat : idbatCherche?.idbat}
    });
  }
  async findScapBat(batId :string, codeScap : string){
    const idbatCherche = await this.prisma.batiment.findFirst({ where : { idsmplr : batId }, select : { idbat: true}});
    if(!idbatCherche){
      console.log("Pas de maquette");
    }
    else{
      return this.prisma.piece.findMany({where : {AND: [
        {idbat: idbatCherche.idbat},
        {codescap: codeScap},
        {asset: { not: JsonNull}}
      ]}});

    }

  }

  }