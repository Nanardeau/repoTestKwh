import { Controller, Get, Param, Post } from '@nestjs/common';
import { CapteurService } from './capteur.service';

@Controller('capteur')
export class CapteurController {
  constructor(private capteurService: CapteurService) {}

  @Get()
  async findAll() {
    return await this.capteurService.findAll();
  }
  
   @Get(':pieceId')
   findAllCapteursPiece(@Param('pieceId') pieceId : string){
      return this.capteurService.findCapteursPiece(pieceId);
   }
   @Get('/warp10/:pieceId&:typeData')
   getRawData(@Param('pieceId') pieceId: string, @Param('typeData') typeData: string){
    return this.capteurService.getRawData(pieceId, typeData);
   }

}
