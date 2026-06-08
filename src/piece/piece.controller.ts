import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PieceService } from './piece.service';

@Controller('piece')
export class PieceController {
  constructor(private pieceService: PieceService) {}

  @Get()
  async findAll() {
    return await this.pieceService.findAll();
  }
   @Get(':pieceId')
   findPieceId(@Param('pieceId') pieceId: string){
    return this.pieceService.findPieceId(pieceId);
   }
   @Get('/pieces/:spaceId')
   findAllSpaceId(@Param('spaceId') spaceId : string){
      return this.pieceService.findAllSpaceId(spaceId);
   }
   @Get('/pieces/etage/:levelIndex&:spaceId')
   findRoomsOnLevel(@Param('levelIndex') levelIndex: string, @Param('spaceId') spaceId: string){
    return this.pieceService.findRoomsLevel(levelIndex, spaceId);
   }
   @Get('lots/:lotId')
   findRoomsLot(@Param('lotId') lotId : string){
    return this.pieceService.findRoomsLot(lotId);
   }
   @Get('/etage/:spaceId')
   findEtages(@Param('spaceId') spaceId: string){
    return this.pieceService.findEtages(spaceId);
   }
   @Post('modif/:pieceId&:newName')
   changeRoomName(@Param('pieceId') pieceId: string, @Param('newName') newName : string){
    return this.pieceService.changeRoomName(pieceId, newName);
   }
}
