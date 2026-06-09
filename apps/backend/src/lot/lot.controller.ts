import { Controller, Get, Param, Post } from '@nestjs/common';
import { LotService } from './lot.service';

@Controller('lot')
export class LotController {
  constructor(private lotService: LotService) {}

  @Get()
  async findAll() {
    return await this.lotService.findAll();
  }
  
   @Get('/lots/:batId')
   findAllBatId(@Param('batId') batId : string){
      return this.lotService.findLotsBat(batId);
   }
   @Get('lots/space/:spaceId')
   findLotsSpcId(@Param('spaceId') spaceId: string){
    return this.lotService.findAllLotsSpcId(spaceId);
   }
}
