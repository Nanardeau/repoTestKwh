import { Controller, Get, Param, Post } from '@nestjs/common';
import { ScapService } from './scap.service';

@Controller('scap')
export class ScapController {
  constructor(private scapService: ScapService) {}

  @Get('/:batId')
  async findAllBatId(@Param('batId') batId: string) {
    return await this.scapService.findAllBatId(batId);
  }
  
   @Get('/piece/:batId&:codeScap')
   findScapBat(@Param('batId') batId : string, @Param('codeScap') codeScap : string){
      return this.scapService.findScapBat(batId, codeScap);
   }

}
