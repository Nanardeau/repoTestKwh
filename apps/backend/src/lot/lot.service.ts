import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LotService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.lot.findMany();
  }
  findLotsBat(batId :string){
    return this.prisma.lot.findMany({where : {idbat : batId}});
  }
  async findAllLotsSpcId(spaceId :string){
    const idbatCherche = await this.prisma.batiment.findFirst({ where : { idsmplr : spaceId } });
    if(!idbatCherche){
      return 'Maquette pas en bdd';
    }
    else{

      return await this.prisma.lot.findMany({
        where : { idbat : idbatCherche?.idbat},
      });
    }

  }


  }