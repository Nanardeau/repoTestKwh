import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isJsonNull, JsonNull } from '@prisma/client/runtime/client';

@Injectable()
export class PieceService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.piece.findMany();
  }
  findPieceId(pieceId: string){
    return this.prisma.piece.findUnique({where: {idpiece : pieceId}});
  }
  async findAllSpaceId(spaceId: string){

    const idbatCherche = await this.prisma.batiment.findFirst({ where : { idsmplr : spaceId } });
    if(!idbatCherche){
      return 'Maquette pas en bdd';
    }
    else{

      return await this.prisma.piece.findMany({
        where : { idbat : idbatCherche?.idbat},

      });
    }
  }
  findRoomsLot(lotId : string){
    return this.prisma.piece.findMany({
      where : {
        idlot : lotId, 
        asset: {not: JsonNull}
        },
    });
  }
  async findRoomsLevel(levelIndex: string, spaceId: string){
    const idbatCherche = await this.prisma.batiment.findFirst({ where : { idsmplr : spaceId } });

    return this.prisma.piece.findMany({
      where: { etage: parseInt(levelIndex), idbat : idbatCherche?.idbat }
    })
  }
  async findEtages(spaceId : string){
    const idBatCherche = await this.prisma.batiment.findFirst({where: {idsmplr : spaceId}});

    if (!idBatCherche) return [];
    return this.prisma.piece.groupBy({
      by: ['etage'],
      _count:{idpiece: true},
      where: {idbat: idBatCherche.idbat, asset: {not: JsonNull}},
      orderBy : {etage : 'asc'}
    });
  }
  changeRoomName(pieceId: string, newName: string){
    return this.prisma.piece.update({
      where : {idpiece: pieceId},
      data: {nompiece: newName}
    })
  }
  /*
  * Dans la BDD on a une colonne "idsmplr dans la table Bâtiment. Il faut que je trouve les pièces qui ont l'idbat dans lequel l'idsmplr = spaceId"
  * En gros : SELECT nompiece, asset FROM pieces INNER JOIN batiment ON pieces.idbat = batiment.idbat AND batiment.idsmplr = :spaceId
  */
//   findAllSpaceId(spaceId: string){
//     let idbatCherche = this.prisma.batiment.findUnique({
//         where : {nombat : spaceId}, 
//         select : { idbat : true }, 
//     });
//     return this.prisma.piece.findMany({where: {idbat : idbatCherche} })
//   }
}
