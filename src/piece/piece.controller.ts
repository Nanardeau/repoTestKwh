import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PieceService } from './piece.service';

@Controller('piece')
export class PieceController {
  constructor(private pieceService: PieceService) {}

  @Get()
  async findAll() {
    return await this.pieceService.findAll();
  }
  
   @Get('/pieces/:spaceId')
   findAllSpaceId(@Param('spaceId') spaceId : string){
      return this.pieceService.findAllSpaceId(spaceId);
   }
   @Get('lots/:lotId')
   findRoomsLot(@Param('lotId') lotId : string){
    return this.pieceService.findRoomsLot(lotId);
   }
}
